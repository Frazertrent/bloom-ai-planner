import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { accountType, entityId } = await req.json();

    if (!accountType || !entityId) {
      throw new Error("Missing required fields: accountType and entityId");
    }

    console.log(`Checking Stripe Connect status for ${accountType}: ${entityId}`);

    // Fetch entity to get stripe_account_id
    let stripeAccountId: string | null = null;
    
    if (accountType === "florist") {
      const { data, error } = await supabase
        .from("bf_florists")
        .select("stripe_account_id")
        .eq("id", entityId)
        .single();
      
      if (error || !data) {
        throw new Error("Florist not found");
      }
      stripeAccountId = data.stripe_account_id;
    } else if (accountType === "organization") {
      const { data, error } = await supabase
        .from("bf_organizations")
        .select("stripe_account_id")
        .eq("id", entityId)
        .single();
      
      if (error || !data) {
        throw new Error("Organization not found");
      }
      stripeAccountId = data.stripe_account_id;
    } else {
      throw new Error("Invalid account type");
    }

    if (!stripeAccountId) {
      return new Response(
        JSON.stringify({ 
          connected: false,
          onboarded: false,
          message: "No Stripe account connected" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retrieve account from Stripe
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);
      
      console.log("Stripe account status:", {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });

      return new Response(
        JSON.stringify({ 
          connected: true,
          onboarded: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          accountId: account.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (stripeError: any) {
      // Account doesn't exist in Stripe
      console.error("Error retrieving Stripe account:", stripeError);
      
      // Clear the invalid account ID from database
      const tableName = accountType === "florist" ? "bf_florists" : "bf_organizations";
      await supabase
        .from(tableName)
        .update({ stripe_account_id: null })
        .eq("id", entityId);

      return new Response(
        JSON.stringify({ 
          connected: false,
          onboarded: false,
          message: "Stripe account not found - cleared from database" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error checking Connect status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
