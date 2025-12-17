import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TEST MODE: Set to false when Stripe is integrated
const TEST_MODE = true;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, magicLinkCode, origin } = await req.json();

    if (!orderId || !magicLinkCode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("bf_orders")
      .select(`
        id,
        order_number,
        total,
        payment_status,
        customer:bf_customers(email, full_name),
        campaign:bf_campaigns(name, organization:bf_organizations(name))
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already paid
    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ 
          error: "Order already paid",
          redirectUrl: `${origin}/order/${magicLinkCode}/success?orderId=${orderId}`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (TEST_MODE) {
      // Return URL to test payment page
      console.log("TEST MODE: Returning test payment URL");
      const checkoutUrl = `${origin}/order/${magicLinkCode}/test-payment?orderId=${orderId}`;
      
      return new Response(
        JSON.stringify({ checkoutUrl, testMode: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PRODUCTION MODE: Create Stripe Checkout Session
    // This code will be uncommented when Stripe is integrated
    /*
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: order.customer?.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${order.campaign?.organization?.name} Fundraiser`,
              description: `Order ${order.order_number} - ${order.campaign?.name}`,
            },
            unit_amount: Math.round(order.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        campaignName: order.campaign?.name,
      },
      success_url: `${origin}/order/${magicLinkCode}/success?orderId=${orderId}`,
      cancel_url: `${origin}/order/${magicLinkCode}/cancel?orderId=${orderId}`,
    });

    // Store session ID in order
    await supabase
      .from("bf_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ checkoutUrl: session.url, testMode: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    */

    // Fallback for when Stripe code is uncommented but env vars aren't set
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
