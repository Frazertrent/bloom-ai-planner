import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOrgProfile } from "@/hooks/useOrgData";
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from "@/hooks/useOrgNotifications";
import { useOrgPayoutHistory, usePendingPayoutCount } from "@/hooks/usePayoutHistory";
import { PayoutHistoryCard } from "@/components/bloomfundr/PayoutHistoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MapPin, Bell, Mail, ShoppingCart, Calendar, AlertTriangle, Info, CreditCard, CheckCircle2, DollarSign, Settings2, Users, UserPlus, Loader2, ExternalLink, Clock } from "lucide-react";
import { CustomOptionsManager } from "@/components/bloomfundr/CustomOptionsManager";
import { useSearchParams } from "react-router-dom";

const PRESET_ORG_TYPES = ["school", "sports", "dance", "cheer", "church", "other"];

const ORG_TYPE_OPTIONS = [
  { value: "school", label: "School" },
  { value: "sports", label: "Sports Team" },
  { value: "dance", label: "Dance Team" },
  { value: "cheer", label: "Cheer Squad" },
  { value: "church", label: "Church/Religious Organization" },
  { value: "other", label: "Other" },
];

const PRESET_GRADES = [
  { value: "kindergarten", label: "Kindergarten" },
  { value: "1st", label: "1st Grade" },
  { value: "2nd", label: "2nd Grade" },
  { value: "3rd", label: "3rd Grade" },
  { value: "4th", label: "4th Grade" },
  { value: "5th", label: "5th Grade" },
  { value: "6th", label: "6th Grade" },
  { value: "7th", label: "7th Grade" },
  { value: "8th", label: "8th Grade" },
  { value: "9th", label: "9th Grade (Freshman)" },
  { value: "10th", label: "10th Grade (Sophomore)" },
  { value: "11th", label: "11th Grade (Junior)" },
  { value: "12th", label: "12th Grade (Senior)" },
];

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { useQueryClient } from "@tanstack/react-query";

export default function OrgSettings() {
  const { user } = useBloomFundrAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: org, isLoading, refetch } = useOrgProfile();
  const { data: notifPrefs, isLoading: prefsLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const { data: payoutHistory = [], isLoading: payoutsLoading, refetch: refetchPayouts } = useOrgPayoutHistory();
  const { data: pendingPayoutCount = 0, refetch: refetchPendingCount } = usePendingPayoutCount("organization", org?.id);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isProcessingPending, setIsProcessingPending] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    onboarded: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  } | null>(null);

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: "",
    org_type: "",
    custom_org_type: "",
    contact_phone: "",
    address: "",
  });

  // Notification preferences state
  const [notifForm, setNotifForm] = useState({
    notification_new_orders: true,
    notification_daily_summary: true,
    notification_campaign_alerts: true,
    notification_email: "",
  });

  // Initialize form with org data
  useEffect(() => {
    if (org) {
      const isPresetType = PRESET_ORG_TYPES.includes(org.org_type || "");
      setOrgForm({
        name: org.name || "",
        org_type: isPresetType ? (org.org_type || "") : "other",
        custom_org_type: isPresetType ? "" : (org.org_type || ""),
        contact_phone: org.contact_phone || "",
        address: org.address || "",
      });
    }
  }, [org]);

  // Initialize notification preferences
  useEffect(() => {
    if (notifPrefs) {
      setNotifForm({
        notification_new_orders: notifPrefs.notification_new_orders ?? true,
        notification_daily_summary: notifPrefs.notification_daily_summary ?? true,
        notification_campaign_alerts: notifPrefs.notification_campaign_alerts ?? true,
        notification_email: notifPrefs.notification_email || "",
      });
    }
  }, [notifPrefs]);

  // Handle Stripe Connect return
  useEffect(() => {
    const stripeSuccess = searchParams.get("stripe_success");
    const stripeRefresh = searchParams.get("stripe_refresh");
    
    if (stripeSuccess === "true") {
      toast.success("Stripe account connected successfully!");
      refetch();
      checkStripeStatus();
    } else if (stripeRefresh === "true") {
      toast.info("Please complete your Stripe onboarding");
    }
  }, [searchParams, refetch]);

  // Check Stripe status on load
  useEffect(() => {
    if (org?.id) {
      checkStripeStatus();
    }
  }, [org?.id]);

  const checkStripeStatus = async () => {
    if (!org?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("check-connect-status", {
        body: { accountType: "organization", entityId: org.id },
      });
      
      if (!error && data) {
        setStripeStatus(data);
      }
    } catch (err) {
      console.error("Error checking Stripe status:", err);
    }
  };

  const handleSaveOrgDetails = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save organization details");
      return;
    }

    if (!orgForm.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    if (!orgForm.org_type) {
      toast.error("Please select an organization type");
      return;
    }

    if (orgForm.org_type === "other" && !orgForm.custom_org_type.trim()) {
      toast.error("Please specify your organization type");
      return;
    }

    // Determine final org_type to save
    const finalOrgType = orgForm.org_type === "other" 
      ? orgForm.custom_org_type.trim() 
      : orgForm.org_type;

    try {
      if (org?.id) {
        // UPDATE existing organization
        const { error } = await supabase
          .from("bf_organizations")
          .update({
            name: orgForm.name.trim(),
            org_type: finalOrgType,
            contact_phone: orgForm.contact_phone || null,
            address: orgForm.address || null,
          })
          .eq("id", org.id);

        if (error) throw error;
      } else {
        // CREATE new organization
        const { error } = await supabase
          .from("bf_organizations")
          .insert({
            user_id: user.id,
            name: orgForm.name.trim(),
            org_type: finalOrgType,
            contact_phone: orgForm.contact_phone || null,
            address: orgForm.address || null,
          });

        if (error) throw error;
        
        // Refresh org profile query
        queryClient.invalidateQueries({ queryKey: ["org-profile"] });
      }
      
      toast.success("Organization details saved");
    } catch (error) {
      console.error("Error saving org details:", error);
      toast.error("Failed to save organization details");
    }
  };

  const handleSaveNotificationPrefs = async () => {
    try {
      await updatePrefs.mutateAsync({
        notification_new_orders: notifForm.notification_new_orders,
        notification_daily_summary: notifForm.notification_daily_summary,
        notification_campaign_alerts: notifForm.notification_campaign_alerts,
        notification_email: notifForm.notification_email || null,
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences");
    }
  };

  const handleConnectStripe = async () => {
    if (!org?.id) return;
    
    setIsConnectingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account", {
        body: { 
          accountType: "organization", 
          entityId: org.id,
          returnUrl: `${window.location.origin}/org/settings?stripe_success=true`,
          refreshUrl: `${window.location.origin}/org/settings?stripe_refresh=true`,
        },
      });

      if (error) throw error;
      
      if (data?.alreadyConnected) {
        toast.success("Stripe account already connected!");
        await checkStripeStatus();
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast.error("Failed to start Stripe onboarding");
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleProcessPendingPayouts = async () => {
    if (!org?.id) return;
    
    setIsProcessingPending(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-pending-payouts", {
        body: { recipientType: "organization", recipientId: org.id },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message || "Pending payouts processed!");
        refetchPayouts();
        refetchPendingCount();
      } else {
        toast.error(data?.error || "Failed to process payouts");
      }
    } catch (error) {
      console.error("Error processing pending payouts:", error);
      toast.error("Failed to process pending payouts");
    } finally {
      setIsProcessingPending(false);
    }
  };

  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization settings
          </p>
        </div>

        {/* Organization Details Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>Your organization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {!org?.id && (
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Complete your organization details to get started with BloomFundr.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input 
                    id="name" 
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="Your organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type</Label>
                  <Select
                    value={orgForm.org_type}
                    onValueChange={(value) => setOrgForm({ 
                      ...orgForm, 
                      org_type: value,
                      custom_org_type: value === "other" ? orgForm.custom_org_type : ""
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {orgForm.org_type === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_type">Please Specify Organization Type</Label>
                    <Input 
                      id="custom_type"
                      value={orgForm.custom_org_type}
                      onChange={(e) => setOrgForm({ ...orgForm, custom_org_type: e.target.value })}
                      placeholder="e.g., Youth Group, Non-Profit, Book Club"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Phone
                  </Label>
                  <Input 
                    id="phone" 
                    value={orgForm.contact_phone}
                    onChange={(e) => setOrgForm({ ...orgForm, contact_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input 
                    id="address" 
                    value={orgForm.address}
                    onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <Button onClick={handleSaveOrgDetails} className="mt-4">
                  Save Changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Settings Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Connect your Stripe account to receive payouts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lifetime Earnings */}
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Lifetime Earnings</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(org?.total_lifetime_earnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total earned across all campaigns</p>
                </div>

                {/* Connection Status */}
                {org?.stripe_account_id && stripeStatus?.onboarded ? (
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-600">Payment Account Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your Stripe account is connected and ready to receive payouts.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Account: <code className="bg-muted px-1 py-0.5 rounded">{org.stripe_account_id.slice(0, 15)}...</code></span>
                      {stripeStatus?.payoutsEnabled && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500">Payouts Enabled</Badge>
                      )}
                    </div>
                  </div>
                ) : org?.stripe_account_id && !stripeStatus?.onboarded ? (
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-600">Onboarding Incomplete</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your Stripe account was created but onboarding is not complete.
                    </p>
                    <Button 
                      onClick={handleConnectStripe}
                      disabled={isConnectingStripe}
                    >
                      {isConnectingStripe ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                      ) : (
                        <><ExternalLink className="h-4 w-4 mr-2" />Complete Stripe Setup</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-600">Payment Account Not Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect your Stripe account to receive payouts from your fundraising campaigns.
                    </p>
                    <Button 
                      onClick={handleConnectStripe}
                      disabled={isConnectingStripe}
                    >
                      {isConnectingStripe ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
                      ) : (
                        <><ExternalLink className="h-4 w-4 mr-2" />Connect Stripe Account</>
                      )}
                    </Button>
                  </div>
                )}

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">How it works:</span> Connect your Stripe account to receive automatic payouts when orders are paid.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History Card */}
        <PayoutHistoryCard
          payouts={payoutHistory}
          isLoading={payoutsLoading}
          pendingCount={pendingPayoutCount}
          hasStripeAccount={!!org?.stripe_account_id && !!stripeStatus?.onboarded}
          isProcessingPending={isProcessingPending}
          onProcessPending={handleProcessPendingPayouts}
        />

        {/* Notification Preferences Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!org?.id ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Save your organization details above first to configure notification preferences.
                </AlertDescription>
              </Alert>
            ) : prefsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Notification Email */}
                <div className="space-y-2">
                  <Label htmlFor="notification_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notification Email
                  </Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={notifForm.notification_email}
                    onChange={(e) => setNotifForm({ ...notifForm, notification_email: e.target.value })}
                    placeholder="notifications@yourorg.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address for receiving notifications. Leave empty to use your account email.
                  </p>
                </div>

                {/* New Order Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      New Order Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when a new order is placed for your campaigns
                    </p>
                  </div>
                  <Switch
                    checked={notifForm.notification_new_orders}
                    onCheckedChange={(checked) =>
                      setNotifForm({ ...notifForm, notification_new_orders: checked })
                    }
                  />
                </div>

                {/* Daily Summary */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Daily Summary
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive a daily summary of orders, revenue, and top sellers
                    </p>
                  </div>
                  <Switch
                    checked={notifForm.notification_daily_summary}
                    onCheckedChange={(checked) =>
                      setNotifForm({ ...notifForm, notification_daily_summary: checked })
                    }
                  />
                </div>

                {/* Campaign Alerts */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Campaign Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Alerts for campaign start, end, and fulfillment reminders
                    </p>
                  </div>
                  <Switch
                    checked={notifForm.notification_campaign_alerts}
                    onCheckedChange={(checked) =>
                      setNotifForm({ ...notifForm, notification_campaign_alerts: checked })
                    }
                  />
                </div>

                <Button 
                  onClick={handleSaveNotificationPrefs}
                  disabled={updatePrefs.isPending}
                  className="mt-4"
                >
                  {updatePrefs.isPending ? "Saving..." : "Save Notification Preferences"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Custom Types Management Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Manage Custom Types
            </CardTitle>
            <CardDescription>
              Add and manage custom dropdown options for your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!org?.id ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Save your organization details above first to manage custom types.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <CustomOptionsManager
                  title="Organization Types"
                  category="org_type"
                  ownerType="organization"
                  ownerId={org.id}
                  presetOptions={ORG_TYPE_OPTIONS.filter(o => o.value !== "other")}
                />
                <CustomOptionsManager
                  title="Student Grades"
                  category="grade"
                  ownerType="organization"
                  ownerId={org.id}
                  presetOptions={PRESET_GRADES}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team & Collaborators Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team & Collaborators
            </CardTitle>
            <CardDescription>
              Invite team members to help manage campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!org?.id ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Save your organization details above first to manage team members.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Invite Team Members</p>
                      <p className="text-sm text-muted-foreground">
                        Add managers or coordinators to help run campaigns
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Input 
                      type="email" 
                      placeholder="colleague@organization.com"
                      className="flex-1"
                      disabled
                    />
                    <Button disabled>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Team invitations coming soon. You'll be able to add collaborators with different permission levels.
                  </p>
                </div>

                {/* Current Team Members Placeholder */}
                <div className="border border-border rounded-lg divide-y divide-border">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Owner</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      You
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
