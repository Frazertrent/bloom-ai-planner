import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOrgProfile } from "@/hooks/useOrgData";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Phone, MapPin } from "lucide-react";

export default function OrgSettings() {
  const { data: org, isLoading } = useOrgProfile();

  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization settings
          </p>
        </div>

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
                    defaultValue={org?.name || ""} 
                    placeholder="Your organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type</Label>
                  <Input 
                    id="type" 
                    defaultValue={org?.org_type || ""} 
                    placeholder="e.g., School, Sports Team"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Phone
                  </Label>
                  <Input 
                    id="phone" 
                    defaultValue={org?.contact_phone || ""} 
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
                    defaultValue={org?.address || ""} 
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <Button className="mt-4">Save Changes</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
