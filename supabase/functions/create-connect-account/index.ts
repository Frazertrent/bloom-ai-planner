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

    const { accountType, entityId, returnUrl, refreshUrl } = await req.json();

    if (!accountType || !entityId) {
      throw new Error("Missing required fields: accountType and entityId");
    }

    console.log(`Creating Stripe Connect account for ${accountType}: ${entityId}`);

    // Fetch entity details based on type
    let entityData;
    if (accountType === "florist") {
      const { data, error } = await supabase
        .from("bf_florists")
        .select("id, business_name, business_address, user_id, stripe_account_id")
        .eq("id", entityId)
        .single();
      
      if (error || !data) {
        throw new Error("Florist not found");
      }
      entityData = data;
    } else if (accountType === "organization") {
      const { data, error } = await supabase
        .from("bf_organizations")
        .select("id, name, address, user_id, stripe_account_id")
        .eq("id", entityId)
        .single();
      
      if (error || !data) {
        throw new Error("Organization not found");
      }
      entityData = data;
    } else {
      throw new Error("Invalid account type. Must be 'florist' or 'organization'");
    }

    // Check if already connected
    if (entityData.stripe_account_id) {
      console.log("Entity already has a Stripe account:", entityData.stripe_account_id);
      
      // Check if account is fully onboarded
      try {
        const account = await stripe.accounts.retrieve(entityData.stripe_account_id);
        
        if (account.details_submitted) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              alreadyConnected: true,
              message: "Account already connected and onboarded" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Account exists but not fully onboarded - create new account link
        console.log("Account exists but not fully onboarded, creating new account link");
        const accountLink = await stripe.accountLinks.create({
          account: entityData.stripe_account_id,
          refresh_url: refreshUrl || `${req.headers.get("origin")}/florist/settings?stripe_refresh=true`,
          return_url: returnUrl || `${req.headers.get("origin")}/florist/settings?stripe_success=true`,
          type: "account_onboarding",
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            url: accountLink.url,
            accountId: entityData.stripe_account_id 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (stripeError) {
        console.log("Error retrieving existing account, will create new one:", stripeError);
        // Account doesn't exist in Stripe anymore, continue to create new one
      }
    }

    // Create new Stripe Connect Express account
    const businessName = accountType === "florist" 
      ? entityData.business_name 
      : entityData.name;

    console.log(`Creating new Stripe Connect Express account for: ${businessName}`);

    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      business_type: "company",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        mcc: "5992", // Florists
      },
      metadata: {
        accountType,
        entityId,
      },
    });

    console.log("Created Stripe account:", account.id);

    // Save the account ID to the database
    const tableName = accountType === "florist" ? "bf_florists" : "bf_organizations";
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ stripe_account_id: account.id })
      .eq("id", entityId);

    if (updateError) {
      console.error("Failed to save Stripe account ID:", updateError);
      // Don't throw - the account was created successfully
    }

    // Create account link for onboarding
    const defaultReturnUrl = accountType === "florist"
      ? `${req.headers.get("origin")}/florist/settings?stripe_success=true`
      : `${req.headers.get("origin")}/org/settings?stripe_success=true`;

    const defaultRefreshUrl = accountType === "florist"
      ? `${req.headers.get("origin")}/florist/settings?stripe_refresh=true`
      : `${req.headers.get("origin")}/org/settings?stripe_refresh=true`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || defaultRefreshUrl,
      return_url: returnUrl || defaultReturnUrl,
      type: "account_onboarding",
    });

    console.log("Created account link, redirecting to:", accountLink.url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: accountLink.url,
        accountId: account.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating Connect account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
