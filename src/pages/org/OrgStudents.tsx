import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function OrgStudents() {
  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage students participating in your fundraisers
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Students in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No students yet</p>
              <p className="text-sm mt-1">Add students to participate in campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
