import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloristProductsPage() {
  return (
    <FloristLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your floral product catalog
            </p>
          </div>
          <Button asChild className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light">
            <Link to="/florist/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        <Card className="bg-bloomfundr-card border-bloomfundr-muted">
          <CardHeader>
            <CardTitle className="text-foreground">Your Products</CardTitle>
            <CardDescription>Products available for campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products yet</p>
              <p className="text-sm mt-1 mb-4">Add products to make them available for campaigns</p>
              <Button asChild className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light">
                <Link to="/florist/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
