import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOrgProfile } from "@/hooks/useOrgData";
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from "@/hooks/useOrgNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Phone, MapPin, Bell, Mail, ShoppingCart, Calendar, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function OrgSettings() {
  const { data: org, isLoading } = useOrgProfile();
  const { data: notifPrefs, isLoading: prefsLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: "",
    org_type: "",
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
      setOrgForm({
        name: org.name || "",
        org_type: org.org_type || "",
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

  const handleSaveOrgDetails = async () => {
    if (!org?.id) return;

    try {
      const { error } = await supabase
        .from("bf_organizations")
        .update({
          name: orgForm.name,
          org_type: orgForm.org_type,
          contact_phone: orgForm.contact_phone,
          address: orgForm.address,
        })
        .eq("id", org.id);

      if (error) throw error;
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
                  <Input 
                    id="type" 
                    value={orgForm.org_type}
                    onChange={(e) => setOrgForm({ ...orgForm, org_type: e.target.value })}
                    placeholder="e.g., School, Sports Team"
                  />
                </div>
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
      </div>
    </OrgLayout>
  );
}
