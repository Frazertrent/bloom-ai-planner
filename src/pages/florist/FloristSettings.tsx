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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, ShoppingCart, Package, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function FloristSettingsPage() {
  const queryClient = useQueryClient();
  const { data: florist, isLoading } = useFloristProfile();
  const { data: notifPrefs, isLoading: prefsLoading } = useFloristNotificationPreferences();
  const updatePrefs = useUpdateFloristNotificationPreferences();
  const [isVerifying, setIsVerifying] = useState(false);
  // Business form state
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_address: "",
    business_phone: "",
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

  const handleSaveBusinessDetails = async () => {
    if (!florist?.id) return;

    try {
      const { error } = await supabase
        .from("bf_florists")
        .update({
          business_name: businessForm.business_name,
          business_address: businessForm.business_address,
          business_phone: businessForm.business_phone,
        })
        .eq("id", florist.id);

      if (error) throw error;
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

        {/* Payment Settings Card */}
        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="text-foreground">Payment Settings</CardTitle>
            <CardDescription>Connect your payment account to receive payouts</CardDescription>
          </CardHeader>
          <CardContent>
            {florist?.stripe_account_id ? (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-600 font-medium">Stripe Connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment account is set up and ready to receive payouts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Connect your Stripe account to receive payouts for fulfilled orders.
                </p>
                <Button variant="outline" className="border-bloomfundr-primary text-bloomfundr-primary">
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
