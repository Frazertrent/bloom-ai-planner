import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { recipientType, recipientId } = await req.json();

    console.log(`Processing pending payouts for ${recipientType}: ${recipientId}`);

    // Get the recipient's Stripe account ID
    let stripeAccountId: string | null = null;
    
    if (recipientType === "florist") {
      const { data: florist } = await supabase
        .from("bf_florists")
        .select("stripe_account_id")
        .eq("id", recipientId)
        .single();
      stripeAccountId = florist?.stripe_account_id;
    } else if (recipientType === "organization") {
      const { data: org } = await supabase
        .from("bf_organizations")
        .select("stripe_account_id")
        .eq("id", recipientId)
        .single();
      stripeAccountId = org?.stripe_account_id;
    }

    if (!stripeAccountId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No Stripe account connected. Please complete Stripe onboarding first." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the Stripe account is fully onboarded
    const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
    if (!stripeAccount.charges_enabled || !stripeAccount.payouts_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Stripe account is not fully onboarded. Please complete Stripe setup." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all pending payouts for this recipient
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from("bf_payouts")
      .select("*")
      .eq("recipient_type", recipientType)
      .eq("recipient_id", recipientId)
      .eq("status", "pending");

    if (payoutsError) {
      throw payoutsError;
    }

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending payouts found",
          processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${pendingPayouts.length} pending payouts to process`);

    let processed = 0;
    let failed = 0;
    const results: any[] = [];

    for (const payout of pendingPayouts) {
      try {
        // Convert amount to cents for Stripe
        const amountInCents = Math.round(payout.amount * 100);

        if (amountInCents <= 0) {
          console.log(`Skipping payout ${payout.id} - amount is zero or negative`);
          continue;
        }

        // Create the Stripe transfer
        const transfer = await stripe.transfers.create({
          amount: amountInCents,
          currency: "usd",
          destination: stripeAccountId,
          transfer_group: payout.campaign_id,
          metadata: {
            payout_id: payout.id,
            campaign_id: payout.campaign_id,
            recipient_type: recipientType,
          },
        });

        console.log(`Transfer created: ${transfer.id} for $${payout.amount}`);

        // Update the payout record
        await supabase
          .from("bf_payouts")
          .update({
            status: "completed",
            stripe_transfer_id: transfer.id,
            processed_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        processed++;
        results.push({
          payout_id: payout.id,
          amount: payout.amount,
          transfer_id: transfer.id,
          status: "completed",
        });

      } catch (transferError: any) {
        console.error(`Failed to process payout ${payout.id}:`, transferError);
        
        // Update payout as failed
        await supabase
          .from("bf_payouts")
          .update({
            status: "failed",
          })
          .eq("id", payout.id);

        failed++;
        results.push({
          payout_id: payout.id,
          amount: payout.amount,
          status: "failed",
          error: transferError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processed} payouts, ${failed} failed`,
        processed,
        failed,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing pending payouts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
