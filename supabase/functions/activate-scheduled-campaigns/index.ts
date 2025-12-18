import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scheduled campaign activation check...");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all campaigns that should be activated
    // status = 'scheduled' AND start_date <= current date
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Checking for scheduled campaigns with start_date <= ${today}`);

    const { data: campaignsToActivate, error: fetchError } = await supabase
      .from('bf_campaigns')
      .select('id, name, start_date, organization_id, florist_id')
      .eq('status', 'scheduled')
      .lte('start_date', today);

    if (fetchError) {
      console.error("Error fetching campaigns:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${campaignsToActivate?.length || 0} campaigns to activate`);

    if (!campaignsToActivate || campaignsToActivate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No campaigns to activate",
          activatedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Activate each campaign
    const campaignIds = campaignsToActivate.map(c => c.id);
    
    const { error: updateError } = await supabase
      .from('bf_campaigns')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .in('id', campaignIds);

    if (updateError) {
      console.error("Error updating campaigns:", updateError);
      throw updateError;
    }

    console.log(`Successfully activated ${campaignIds.length} campaigns`);

    // Create notifications for each activated campaign
    const notifications = [];
    
    for (const campaign of campaignsToActivate) {
      // Notification for organization
      notifications.push({
        organization_id: campaign.organization_id,
        title: "Campaign Now Live!",
        message: `Your campaign "${campaign.name}" is now active and accepting orders.`,
        notification_type: "campaign_status",
        link_url: `/org/campaigns/${campaign.id}`,
        is_read: false,
      });

      // Notification for florist
      notifications.push({
        florist_id: campaign.florist_id,
        title: "Campaign Now Live!",
        message: `The campaign "${campaign.name}" is now active. Orders may start coming in.`,
        notification_type: "campaign_status",
        link_url: `/florist/campaigns/${campaign.id}`,
        is_read: false,
      });
    }

    // Insert org notifications
    const orgNotifications = notifications.filter(n => n.organization_id);
    if (orgNotifications.length > 0) {
      const { error: orgNotifyError } = await supabase
        .from('bf_notifications')
        .insert(orgNotifications.map(n => ({
          organization_id: n.organization_id,
          title: n.title,
          message: n.message,
          notification_type: n.notification_type,
          link_url: n.link_url,
          is_read: n.is_read,
        })));
      
      if (orgNotifyError) {
        console.warn("Error creating org notifications:", orgNotifyError);
      }
    }

    // Insert florist notifications
    const floristNotifications = notifications.filter(n => n.florist_id);
    if (floristNotifications.length > 0) {
      const { error: floristNotifyError } = await supabase
        .from('bf_florist_notifications')
        .insert(floristNotifications.map(n => ({
          florist_id: n.florist_id,
          title: n.title,
          message: n.message,
          notification_type: n.notification_type,
          link_url: n.link_url,
          is_read: n.is_read,
        })));
      
      if (floristNotifyError) {
        console.warn("Error creating florist notifications:", floristNotifyError);
      }
    }

    const activatedNames = campaignsToActivate.map(c => c.name).join(', ');
    console.log(`Activated campaigns: ${activatedNames}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Activated ${campaignIds.length} campaign(s)`,
        activatedCount: campaignIds.length,
        activatedCampaigns: campaignsToActivate.map(c => ({ id: c.id, name: c.name }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in activate-scheduled-campaigns:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
