import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
  }
  return stripeClient;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = getStripe();

    // Get the signature from Stripe
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature found");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw body
    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received Stripe webhook event:", event.type);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.error("No orderId in session metadata");
          break;
        }

        // Process the payment completion
        await processPaymentComplete(supabase, stripe, orderId, session.payment_intent as string);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment intent succeeded:", paymentIntent.id);
        // This is handled by checkout.session.completed for our flow
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processPaymentComplete(supabase: any, stripe: Stripe, orderId: string, paymentIntentId: string) {
  console.log("Processing payment completion for order:", orderId);

  // Fetch order details with florist and org stripe account IDs
  const { data: order, error: orderError } = await supabase
    .from("bf_orders")
    .select(`
      id,
      order_number,
      total,
      subtotal,
      platform_fee,
      processing_fee,
      payment_status,
      campaign_id,
      customer_id,
      customer:bf_customers(email, full_name),
      campaign:bf_campaigns(
        id,
        name,
        florist_id,
        organization_id,
        florist_margin_percent,
        organization_margin_percent,
        platform_fee_percent,
        florist:bf_florists(id, stripe_account_id, business_name),
        organization:bf_organizations(id, name, stripe_account_id)
      )
    `)
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Failed to fetch order:", orderError);
    return;
  }

  // Skip if already paid
  if (order.payment_status === "paid") {
    console.log("Order already marked as paid, skipping");
    return;
  }

  // Fetch order items
  const { data: orderItems, error: itemsError } = await supabase
    .from("bf_order_items")
    .select(`
      id,
      quantity,
      unit_price,
      campaign_product:bf_campaign_products(
        product:bf_products(name)
      )
    `)
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("Failed to fetch order items:", itemsError);
  }

  // Calculate payouts
  const campaign = order.campaign;
  const netAmount = order.subtotal - order.platform_fee - order.processing_fee;
  
  const floristPercent = campaign.florist_margin_percent / 100;
  const orgPercent = campaign.organization_margin_percent / 100;
  
  const floristPayout = Math.round(netAmount * floristPercent * 100) / 100; // Round to cents
  const orgPayout = Math.round(netAmount * orgPercent * 100) / 100;

  console.log("Payout calculations:", {
    subtotal: order.subtotal,
    platformFee: order.platform_fee,
    processingFee: order.processing_fee,
    netAmount,
    floristPayout,
    orgPayout,
    floristStripeId: campaign.florist?.stripe_account_id,
    orgStripeId: campaign.organization?.stripe_account_id,
  });

  // Update order status
  const { error: updateError } = await supabase
    .from("bf_orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("Failed to update order:", updateError);
    return;
  }

  console.log("Order marked as paid");

  // Process florist payout
  const floristPayoutResult = await processTransfer(
    stripe,
    supabase,
    campaign.id,
    "florist",
    campaign.florist_id,
    campaign.florist?.stripe_account_id,
    floristPayout,
    order.order_number
  );

  // Process organization payout
  const orgPayoutResult = await processTransfer(
    stripe,
    supabase,
    campaign.id,
    "organization",
    campaign.organization_id,
    campaign.organization?.stripe_account_id,
    orgPayout,
    order.order_number
  );

  // Update lifetime earnings for florist (only if transfer was successful or pending)
  if (floristPayoutResult.success || floristPayoutResult.status === "pending") {
    await supabase
      .from("bf_florists")
      .update({ 
        total_lifetime_earnings: supabase.rpc ? undefined : floristPayout
      })
      .eq("id", campaign.florist_id);
    
    // Try RPC first for atomic update
    await supabase.rpc("increment_florist_earnings", {
      florist_uuid: campaign.florist_id,
      amount: floristPayout,
    }).catch(() => {
      console.log("RPC not available, using direct update for florist earnings");
    });
  }

  // Update lifetime earnings for organization
  if (orgPayoutResult.success || orgPayoutResult.status === "pending") {
    await supabase.rpc("increment_org_earnings", {
      org_uuid: campaign.organization_id,
      amount: orgPayout,
    }).catch(() => {
      console.log("RPC not available, using direct update for org earnings");
    });
  }

  // Send confirmation email
  try {
    await supabase.functions.invoke("send-email", {
      body: {
        type: "order-confirmation",
        to: order.customer?.email,
        data: {
          customerName: order.customer?.full_name,
          orderNumber: order.order_number,
          organizationName: campaign.organization?.name,
          campaignName: campaign.name,
          total: order.total,
          items: orderItems?.map((item: any) => ({
            name: item.campaign_product?.product?.name || "Product",
            quantity: item.quantity,
            price: item.unit_price,
          })) || [],
        },
      },
    });
    console.log("Confirmation email sent");
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
  }

  console.log("Payment processing complete for order:", order.order_number);
}

async function processTransfer(
  stripe: Stripe,
  supabase: any,
  campaignId: string,
  recipientType: "florist" | "organization",
  recipientId: string,
  stripeAccountId: string | null,
  amount: number,
  orderNumber: string
): Promise<{ success: boolean; status: string; transferId?: string; error?: string }> {
  
  console.log(`Processing ${recipientType} transfer: $${amount} to ${stripeAccountId || "no account"}`);

  // Skip if amount is 0 or negative
  if (amount <= 0) {
    console.log(`Skipping ${recipientType} transfer - amount is $${amount}`);
    return { success: true, status: "skipped" };
  }

  // If no Stripe account connected, create pending payout record
  if (!stripeAccountId) {
    console.log(`${recipientType} has no Stripe account connected, creating pending payout`);
    
    const { error: payoutError } = await supabase
      .from("bf_payouts")
      .insert({
        campaign_id: campaignId,
        recipient_type: recipientType,
        recipient_id: recipientId,
        amount: amount,
        status: "pending",
      });

    if (payoutError) {
      console.error(`Failed to create pending payout for ${recipientType}:`, payoutError);
      return { success: false, status: "error", error: payoutError.message };
    }

    return { success: false, status: "pending" };
  }

  // Execute the transfer via Stripe
  try {
    const amountInCents = Math.round(amount * 100);
    
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: stripeAccountId,
      metadata: {
        campaignId,
        recipientType,
        recipientId,
        orderNumber,
      },
      description: `BloomFundr payout for order ${orderNumber}`,
    });

    console.log(`Transfer successful for ${recipientType}:`, transfer.id);

    // Create completed payout record
    const { error: payoutError } = await supabase
      .from("bf_payouts")
      .insert({
        campaign_id: campaignId,
        recipient_type: recipientType,
        recipient_id: recipientId,
        amount: amount,
        status: "completed",
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
      });

    if (payoutError) {
      console.error(`Failed to create payout record for ${recipientType}:`, payoutError);
    }

    return { success: true, status: "completed", transferId: transfer.id };

  } catch (transferError: any) {
    console.error(`Transfer failed for ${recipientType}:`, transferError);

    // Create failed payout record for tracking
    await supabase
      .from("bf_payouts")
      .insert({
        campaign_id: campaignId,
        recipient_type: recipientType,
        recipient_id: recipientId,
        amount: amount,
        status: "failed",
      });

    return { success: false, status: "failed", error: transferError.message };
  }
}
