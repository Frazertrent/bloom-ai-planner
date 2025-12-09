import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function FloristOrdersPage() {
  return (
    <FloristLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and fulfill customer orders
          </p>
        </div>

        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="text-foreground">All Orders</CardTitle>
            <CardDescription>Orders from all your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here when customers purchase from your campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
