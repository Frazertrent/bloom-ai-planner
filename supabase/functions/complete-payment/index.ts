import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current order with campaign and customer data
    const { data: order, error: fetchError } = await supabase
      .from("bf_orders")
      .select(`
        id, 
        payment_status, 
        order_number,
        subtotal,
        total,
        processing_fee,
        platform_fee,
        campaign_id,
        customer_id,
        attributed_student_id
      `)
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("Order fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already paid
    if (order.payment_status === "paid") {
      console.log(`Order ${order.order_number} already marked as paid`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order already paid",
          orderNumber: order.order_number 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch campaign data for margin calculations and email
    const { data: campaign, error: campaignError } = await supabase
      .from("bf_campaigns")
      .select(`
        id,
        name,
        florist_id,
        organization_id,
        florist_margin_percent,
        organization_margin_percent,
        platform_fee_percent,
        pickup_date,
        pickup_location
      `)
      .eq("id", order.campaign_id)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign fetch error:", campaignError);
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch customer data for email
    const { data: customer } = await supabase
      .from("bf_customers")
      .select("id, email, full_name")
      .eq("id", order.customer_id)
      .single();

    // Fetch organization name
    const { data: organization } = await supabase
      .from("bf_organizations")
      .select("name")
      .eq("id", campaign.organization_id)
      .single();

    // Fetch order items for email
    const { data: orderItems } = await supabase
      .from("bf_order_items")
      .select(`
        quantity,
        unit_price,
        recipient_name,
        campaign_product:bf_campaign_products(
          product:bf_products(name)
        )
      `)
      .eq("order_id", orderId);

    // Fetch seller name if attributed
    let sellerName: string | undefined;
    if (order.attributed_student_id) {
      const { data: student } = await supabase
        .from("bf_students")
        .select("name")
        .eq("id", order.attributed_student_id)
        .single();
      sellerName = student?.name;
    }

    // Calculate payouts
    const subtotal = Number(order.subtotal) || 0;
    const processingFee = Number(order.processing_fee) || 0;
    const platformFee = Number(order.platform_fee) || 0;
    const floristMargin = Number(campaign.florist_margin_percent) || 0;
    const orgMargin = Number(campaign.organization_margin_percent) || 0;

    // Available for distribution = subtotal - processing fee - platform fee
    const availableForDistribution = subtotal - processingFee - platformFee;
    
    // Split based on margin percentages
    const totalMargin = floristMargin + orgMargin;
    let floristAmount = 0;
    let orgAmount = 0;
    
    if (totalMargin > 0) {
      floristAmount = availableForDistribution * (floristMargin / totalMargin);
      orgAmount = availableForDistribution * (orgMargin / totalMargin);
    }

    // Round to 2 decimal places
    floristAmount = Math.round(floristAmount * 100) / 100;
    orgAmount = Math.round(orgAmount * 100) / 100;

    console.log(`Payout calculation for order ${order.order_number}:`, {
      subtotal,
      processingFee,
      platformFee,
      availableForDistribution,
      floristMargin,
      orgMargin,
      floristAmount,
      orgAmount
    });

    // Update order to paid status
    const { error: updateError } = await supabase
      .from("bf_orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payout records (status: 'completed' for test mode - no actual money moves)
    const payoutPromises = [];

    if (floristAmount > 0) {
      payoutPromises.push(
        supabase.from("bf_payouts").insert({
          campaign_id: campaign.id,
          recipient_type: "florist",
          recipient_id: campaign.florist_id,
          amount: floristAmount,
          status: "completed", // Test mode - mark as completed immediately
          processed_at: new Date().toISOString(),
        })
      );
    }

    if (orgAmount > 0) {
      payoutPromises.push(
        supabase.from("bf_payouts").insert({
          campaign_id: campaign.id,
          recipient_type: "organization",
          recipient_id: campaign.organization_id,
          amount: orgAmount,
          status: "completed", // Test mode - mark as completed immediately
          processed_at: new Date().toISOString(),
        })
      );
    }

    // Execute payout inserts
    const payoutResults = await Promise.all(payoutPromises);
    for (const result of payoutResults) {
      if (result.error) {
        console.error("Payout insert error:", result.error);
        // Don't fail the whole request - payment is already marked as paid
      }
    }

    // Update lifetime earnings for florist
    if (floristAmount > 0) {
      const { error: floristUpdateError } = await supabase.rpc('increment_florist_earnings', {
        florist_uuid: campaign.florist_id,
        amount: floristAmount
      }).catch(async () => {
        // Fallback: direct update if RPC doesn't exist
        return await supabase
          .from("bf_florists")
          .update({ 
            total_lifetime_earnings: supabase.rpc('coalesce_add', { 
              current_val: 'total_lifetime_earnings', 
              add_val: floristAmount 
            })
          })
          .eq("id", campaign.florist_id);
      });

      // If RPC failed, do a direct SQL approach
      if (floristUpdateError) {
        console.log("Using direct update for florist earnings");
        const { data: florist } = await supabase
          .from("bf_florists")
          .select("total_lifetime_earnings")
          .eq("id", campaign.florist_id)
          .single();
        
        const currentEarnings = Number(florist?.total_lifetime_earnings) || 0;
        await supabase
          .from("bf_florists")
          .update({ total_lifetime_earnings: currentEarnings + floristAmount })
          .eq("id", campaign.florist_id);
      }
    }

    // Update lifetime earnings for organization
    if (orgAmount > 0) {
      const { data: org } = await supabase
        .from("bf_organizations")
        .select("total_lifetime_earnings")
        .eq("id", campaign.organization_id)
        .single();
      
      const currentEarnings = Number(org?.total_lifetime_earnings) || 0;
      const { error: orgUpdateError } = await supabase
        .from("bf_organizations")
        .update({ total_lifetime_earnings: currentEarnings + orgAmount })
        .eq("id", campaign.organization_id);

      if (orgUpdateError) {
        console.error("Org earnings update error:", orgUpdateError);
      }
    }

    // Send order confirmation email (non-blocking)
    if (customer?.email) {
      try {
        const emailItems = orderItems?.map(item => ({
          name: (item.campaign_product as any)?.product?.name || 'Product',
          quantity: item.quantity,
          price: item.unit_price,
          recipientName: item.recipient_name || undefined,
        })) || [];

        const pickupDate = campaign.pickup_date 
          ? new Date(campaign.pickup_date).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })
          : undefined;

        const emailPayload = {
          type: 'order_confirmation',
          to: customer.email,
          data: {
            customerName: customer.full_name,
            orderNumber: order.order_number,
            items: emailItems,
            subtotal: subtotal,
            total: Number(order.total) || subtotal,
            sellerName,
            organizationName: organization?.name || 'Organization',
            campaignName: campaign.name,
            pickupDate,
            pickupLocation: campaign.pickup_location || undefined,
          },
        };

        console.log('Sending order confirmation email:', emailPayload);

        // Call send-email edge function
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: emailPayload,
        });

        if (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
        } else {
          console.log('Order confirmation email sent successfully');
        }
      } catch (emailErr) {
        console.error('Error preparing order confirmation email:', emailErr);
        // Don't fail the payment process for email errors
      }
    }

    console.log(`Payment completed for order ${order.order_number}. Payouts: Florist $${floristAmount}, Org $${orgAmount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment completed",
        orderNumber: order.order_number,
        payouts: {
          florist: floristAmount,
          organization: orgAmount
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error completing payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
