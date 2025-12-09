import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFloristProfile } from "@/hooks/useFloristData";
import { Skeleton } from "@/components/ui/skeleton";

export default function FloristSettingsPage() {
  const { data: florist, isLoading } = useFloristProfile();

  return (
    <FloristLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your florist profile and preferences
          </p>
        </div>

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
                    defaultValue={florist?.business_name || ""}
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Business Address</Label>
                  <Input
                    id="business_address"
                    defaultValue={florist?.business_address || ""}
                    placeholder="123 Main St, City, State"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Business Phone</Label>
                  <Input
                    id="business_phone"
                    defaultValue={florist?.business_phone || ""}
                    placeholder="(555) 123-4567"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                  />
                </div>
                <Button className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light mt-4">
                  Save Changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>

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
