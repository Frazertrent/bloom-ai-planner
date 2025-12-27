import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFloristProfile } from "@/hooks/useFloristData";
import { 
  useFloristNotificationPreferences, 
  useUpdateFloristNotificationPreferences 
} from "@/hooks/useFloristNotifications";
import { useFloristPayoutHistory, usePendingPayoutCount } from "@/hooks/usePayoutHistory";
import { PayoutHistoryCard } from "@/components/bloomfundr/PayoutHistoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, ShoppingCart, Package, CheckCircle2, Clock, ShieldCheck, CreditCard, DollarSign, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

export default function FloristSettingsPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: florist, isLoading, refetch } = useFloristProfile();
  const { data: notifPrefs, isLoading: prefsLoading } = useFloristNotificationPreferences();
  const updatePrefs = useUpdateFloristNotificationPreferences();
  const { data: payoutHistory = [], isLoading: payoutsLoading, refetch: refetchPayouts } = useFloristPayoutHistory();
  const { data: pendingPayoutCount = 0, refetch: refetchPendingCount } = usePendingPayoutCount("florist", florist?.id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPending, setIsProcessingPending] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    onboarded: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  } | null>(null);
  // Business form state
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
    city: "",
    state: "",
  });

  // Notification preferences state
  const [notifForm, setNotifForm] = useState({
    notification_new_orders: true,
    notification_fulfillment_reminders: true,
    notification_email: "",
  });

  // Initialize business form
  useEffect(() => {
    if (florist) {
      setBusinessForm({
        business_name: florist.business_name || "",
        business_address: florist.business_address || "",
        business_phone: florist.business_phone || "",
        city: (florist as any).city || "",
        state: (florist as any).state || "",
      });
    }
  }, [florist]);

  // Initialize notification preferences
  useEffect(() => {
    if (notifPrefs) {
      setNotifForm({
        notification_new_orders: notifPrefs.notification_new_orders ?? true,
        notification_fulfillment_reminders: notifPrefs.notification_fulfillment_reminders ?? true,
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
    if (florist?.id) {
      checkStripeStatus();
    }
  }, [florist?.id]);

  const checkStripeStatus = async () => {
    if (!florist?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("check-connect-status", {
        body: { accountType: "florist", entityId: florist.id },
      });
      
      if (!error && data) {
        setStripeStatus(data);
      }
    } catch (err) {
      console.error("Error checking Stripe status:", err);
    }
  };

  const handleSaveBusinessDetails = async () => {
    if (!florist?.id) return;

    try {
      const { error } = await supabase
        .from("bf_florists")
        .update({
          business_name: businessForm.business_name,
          business_address: businessForm.business_address,
          business_phone: businessForm.business_phone,
          city: businessForm.city || null,
          state: businessForm.state || null,
        })
        .eq("id", florist.id);

      if (error) throw error;
      
      // Refresh florist profile to update verification status display
      queryClient.invalidateQueries({ queryKey: ["florist-profile"] });
      toast.success("Business details saved");
    } catch (error) {
      console.error("Error saving business details:", error);
      toast.error("Failed to save business details");
    }
  };

  const handleSaveNotificationPrefs = async () => {
    try {
      await updatePrefs.mutateAsync({
        notification_new_orders: notifForm.notification_new_orders,
        notification_fulfillment_reminders: notifForm.notification_fulfillment_reminders,
        notification_email: notifForm.notification_email || null,
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences");
    }
  };

  const handleRequestVerification = async () => {
    if (!florist?.id) return;
    
    // Validate required fields
    if (!florist.business_name || !florist.business_address || !florist.business_phone) {
      toast.error("Please complete your business information before requesting verification");
      return;
    }

    setIsVerifying(true);
    try {
      // In a production app, this would create a verification request for admin review
      // For now, we'll auto-verify to make the app testable
      const { error } = await supabase
        .from("bf_florists")
        .update({ is_verified: true })
        .eq("id", florist.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["florist-profile"] });
      toast.success("Your business has been verified! You can now be selected for campaigns.");
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast.error("Failed to request verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!florist?.id) return;
    
    setIsConnectingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account", {
        body: { 
          accountType: "florist", 
          entityId: florist.id,
          returnUrl: `${window.location.origin}/florist/settings?stripe_success=true`,
          refreshUrl: `${window.location.origin}/florist/settings?stripe_refresh=true`,
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

  const handleDisconnectStripe = async () => {
    if (!florist?.id) return;
    
    try {
      const { error } = await supabase
        .from("bf_florists")
        .update({ stripe_account_id: null })
        .eq("id", florist.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["florist-profile"] });
      toast.success("Stripe account disconnected");
    } catch (error) {
      console.error("Error disconnecting Stripe:", error);
      toast.error("Failed to disconnect");
    }
  };

  const handleProcessPendingPayouts = async () => {
    if (!florist?.id) return;
    
    setIsProcessingPending(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-pending-payouts", {
        body: { recipientType: "florist", recipientId: florist.id },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <FloristLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your florist profile and preferences
          </p>
        </div>

        {/* Verification Status Card */}
        <Card className={`border-2 ${florist?.is_verified ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5" />
              Verification Status
            </CardTitle>
            <CardDescription>
              Verified florists can be selected by organizations for campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : florist?.is_verified ? (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">Verified Business</span>
                    <Badge className="bg-green-500 text-white">Verified</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your business is verified and visible to organizations creating campaigns.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-600">Not Yet Verified</span>
                      <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete your business information and request verification to be visible to organizations.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Requirements for verification:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className={florist?.business_name ? "text-green-600" : ""}>
                      {florist?.business_name ? "✓" : "•"} Business name
                    </li>
                    <li className={florist?.business_address ? "text-green-600" : ""}>
                      {florist?.business_address ? "✓" : "•"} Business address
                    </li>
                    <li className={florist?.business_phone ? "text-green-600" : ""}>
                      {florist?.business_phone ? "✓" : "•"} Business phone
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={handleRequestVerification}
                  disabled={isVerifying || !florist?.business_name || !florist?.business_address || !florist?.business_phone}
                  className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
                >
                  {isVerifying ? "Verifying..." : "Request Verification"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Information Card */}
        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="text-foreground">Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={businessForm.business_name}
                    onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Business Address</Label>
                  <Input
                    id="business_address"
                    value={businessForm.business_address}
                    onChange={(e) => setBusinessForm({ ...businessForm, business_address: e.target.value })}
                    placeholder="123 Main St, City, State"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Business Phone</Label>
                  <Input
                    id="business_phone"
                    value={businessForm.business_phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, business_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={businessForm.city}
                      onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                      placeholder="Denver"
                      className="bg-bloomfundr-background border-bloomfundr-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={businessForm.state}
                      onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value.toUpperCase() })}
                      placeholder="CO"
                      maxLength={2}
                      className="bg-bloomfundr-background border-bloomfundr-muted uppercase"
                    />
                    <p className="text-xs text-muted-foreground">Two-letter code</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveBusinessDetails}
                  className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light mt-4"
                >
                  Save Changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Settings Card */}
        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
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
                    {formatCurrency(florist?.total_lifetime_earnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total earned across all campaigns</p>
                </div>

                {/* Connection Status */}
                {florist?.stripe_account_id && stripeStatus?.onboarded ? (
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-600">Payment Account Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your Stripe account is connected and ready to receive payouts.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Account: <code className="bg-muted px-1 py-0.5 rounded">{florist.stripe_account_id.slice(0, 15)}...</code></span>
                      {stripeStatus?.payoutsEnabled && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500">Payouts Enabled</Badge>
                      )}
                    </div>
                  </div>
                ) : florist?.stripe_account_id && !stripeStatus?.onboarded ? (
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-600">Onboarding Incomplete</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your Stripe account was created but onboarding is not complete. Please finish setting up your account.
                    </p>
                    <Button 
                      onClick={handleConnectStripe}
                      disabled={isConnectingStripe}
                      className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
                    >
                      {isConnectingStripe ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Complete Stripe Setup
                        </>
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
                      Connect your Stripe account to receive payouts for fulfilled orders. You'll be redirected to Stripe's secure onboarding.
                    </p>
                    <Button 
                      onClick={handleConnectStripe}
                      disabled={isConnectingStripe}
                      className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
                    >
                      {isConnectingStripe ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect Stripe Account
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Info Note */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">How it works:</span> When you connect your Stripe account, you'll be redirected to Stripe's secure onboarding where you can enter your banking details. Payouts are automatically transferred after orders are paid.
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
          hasStripeAccount={!!florist?.stripe_account_id && !!stripeStatus?.onboarded}
          isProcessingPending={isProcessingPending}
          onProcessPending={handleProcessPendingPayouts}
        />

        {/* Notification Preferences Card */}
        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {prefsLoading ? (
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
                    placeholder="notifications@yourbusiness.com"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
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
                      Get notified when new orders are placed for your campaigns
                    </p>
                  </div>
                  <Switch
                    checked={notifForm.notification_new_orders}
                    onCheckedChange={(checked) =>
                      setNotifForm({ ...notifForm, notification_new_orders: checked })
                    }
                  />
                </div>

                {/* Fulfillment Reminders */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Fulfillment Reminders
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive reminders before pickup dates and fulfillment deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifForm.notification_fulfillment_reminders}
                    onCheckedChange={(checked) =>
                      setNotifForm({ ...notifForm, notification_fulfillment_reminders: checked })
                    }
                  />
                </div>

                {/* Campaign Invitations Note */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note:</span> New campaign invitation notifications are always enabled to ensure you don't miss partnership opportunities.
                  </p>
                </div>

                <Button 
                  onClick={handleSaveNotificationPrefs}
                  disabled={updatePrefs.isPending}
                  className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light mt-4"
                >
                  {updatePrefs.isPending ? "Saving..." : "Save Notification Preferences"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
