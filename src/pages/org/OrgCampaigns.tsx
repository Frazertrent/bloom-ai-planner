import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function OrgCampaigns() {
  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your fundraising campaigns
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>Your fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No campaigns yet</p>
              <p className="text-sm mt-1">Create your first campaign to start fundraising</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
