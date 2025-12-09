import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { AddProductDialog } from "@/components/bloomfundr/AddProductDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  ImageOff,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFloristProducts, useDeleteProduct, useToggleProductStatus } from "@/hooks/useFloristProducts";
import { toast } from "sonner";
import type { ProductCategory, BFProduct } from "@/types/bloomfundr";

const categoryColors: Record<ProductCategory, string> = {
  boutonniere: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  corsage: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  bouquet: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  custom: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const categoryLabels: Record<ProductCategory, string> = {
  boutonniere: "Boutonniere",
  corsage: "Corsage",
  bouquet: "Bouquet",
  custom: "Custom",
};

export default function FloristProductsPage() {
  const [activeTab, setActiveTab] = useState<ProductCategory | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<BFProduct | null>(null);

  const { data: products, isLoading } = useFloristProducts(activeTab);
  const queryClient = useQueryClient();
  const deleteProductFn = useDeleteProduct();
  const toggleStatusFn = useToggleProductStatus();

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProductFn(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["florist-products"] });
      queryClient.invalidateQueries({ queryKey: ["florist-stats"] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      toggleStatusFn(id, isActive),
    onSuccess: () => {
      toast.success("Product status updated");
      queryClient.invalidateQueries({ queryKey: ["florist-products"] });
      queryClient.invalidateQueries({ queryKey: ["florist-stats"] });
    },
    onError: () => {
      toast.error("Failed to update product status");
    },
  });

  const handleDelete = (product: BFProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  return (
    <FloristLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your floral product catalog
            </p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProductCategory | "all")}>
          <TabsList className="bg-bloomfundr-card border border-bloomfundr-muted">
            <TabsTrigger value="all" className="data-[state=active]:bg-bloomfundr-primary data-[state=active]:text-bloomfundr-primary-foreground">
              All
            </TabsTrigger>
            <TabsTrigger value="boutonniere" className="data-[state=active]:bg-bloomfundr-primary data-[state=active]:text-bloomfundr-primary-foreground">
              Boutonnieres
            </TabsTrigger>
            <TabsTrigger value="corsage" className="data-[state=active]:bg-bloomfundr-primary data-[state=active]:text-bloomfundr-primary-foreground">
              Corsages
            </TabsTrigger>
            <TabsTrigger value="bouquet" className="data-[state=active]:bg-bloomfundr-primary data-[state=active]:text-bloomfundr-primary-foreground">
              Bouquets
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-bloomfundr-primary data-[state=active]:text-bloomfundr-primary-foreground">
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-bloomfundr-card border-bloomfundr-muted">
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`bg-bloomfundr-card border-bloomfundr-muted overflow-hidden transition-all hover:shadow-lg ${
                  !product.is_active ? "opacity-60" : ""
                }`}
              >
                {/* Product Image */}
                <div className="h-40 bg-muted/30 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={`absolute top-2 right-2 ${
                      product.is_active
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Product Details */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {product.name}
                      </h3>
                      <Badge variant="outline" className={categoryColors[product.category as ProductCategory]}>
                        {categoryLabels[product.category as ProductCategory]}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: product.id,
                              isActive: !product.is_active,
                            })
                          }
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-bloomfundr-primary">
                      ${Number(product.base_cost).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">base cost</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-sm mt-1 mb-4">
                  {activeTab === "all"
                    ? "Add products to make them available for campaigns"
                    : `No ${categoryLabels[activeTab as ProductCategory].toLowerCase()}s found`}
                </p>
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-bloomfundr-card border-bloomfundr-muted">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-bloomfundr-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FloristLayout>
  );
}
