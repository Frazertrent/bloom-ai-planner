import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function FloristCampaignsPage() {
  return (
    <FloristLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your fundraising campaigns
          </p>
        </div>

        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="text-foreground">Your Campaigns</CardTitle>
            <CardDescription>Campaigns you're fulfilling for organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No campaigns yet</p>
              <p className="text-sm mt-1">Organizations will invite you to fulfill campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
