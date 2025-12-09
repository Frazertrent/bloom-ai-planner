import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function OrgReports() {
  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View detailed analytics and reports
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Sales Reports</CardTitle>
            <CardDescription>Detailed fundraising analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm mt-1">Reports will appear once you have sales</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
