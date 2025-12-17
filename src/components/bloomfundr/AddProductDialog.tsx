import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "@/hooks/useFloristData";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProductImageUpload } from "./ProductImageUpload";
import type { ProductCategory } from "@/types/bloomfundr";

const productSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  category: z.enum(["boutonniere", "corsage", "bouquet", "custom"], {
    required_error: "Please select a category",
  }),
  base_cost: z.coerce.number().min(0.01, "Cost must be greater than 0").max(10000, "Cost seems too high"),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { data: florist } = useFloristProfile();
  const queryClient = useQueryClient();
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [ribbonOptions, setRibbonOptions] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newRibbon, setNewRibbon] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      base_cost: 0,
      image_url: null,
      is_active: true,
    },
  });

  const createProduct = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!florist?.id) throw new Error("Florist profile not found");

      const customizationOptions = {
        colors: colorOptions.length > 0 ? colorOptions : undefined,
        ribbon_colors: ribbonOptions.length > 0 ? ribbonOptions : undefined,
      };

      const { data, error } = await supabase
        .from("bf_products")
        .insert({
          florist_id: florist.id,
          name: values.name,
          description: values.description || null,
          category: values.category,
          base_cost: values.base_cost,
          image_url: values.image_url || null,
          is_active: values.is_active,
          customization_options: Object.keys(customizationOptions).some(
            (k) => customizationOptions[k as keyof typeof customizationOptions]
          )
            ? customizationOptions
            : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["florist-products"] });
      queryClient.invalidateQueries({ queryKey: ["florist-stats"] });
      handleClose();
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.");
    },
  });

  const handleClose = () => {
    form.reset();
    setColorOptions([]);
    setRibbonOptions([]);
    setNewColor("");
    setNewRibbon("");
    onOpenChange(false);
  };

  const addColorOption = () => {
    const trimmed = newColor.trim();
    if (trimmed && !colorOptions.includes(trimmed)) {
      setColorOptions([...colorOptions, trimmed]);
      setNewColor("");
    }
  };

  const removeColorOption = (color: string) => {
    setColorOptions(colorOptions.filter((c) => c !== color));
  };

  const addRibbonOption = () => {
    const trimmed = newRibbon.trim();
    if (trimmed && !ribbonOptions.includes(trimmed)) {
      setRibbonOptions([...ribbonOptions, trimmed]);
      setNewRibbon("");
    }
  };

  const removeRibbonOption = (ribbon: string) => {
    setRibbonOptions(ribbonOptions.filter((r) => r !== ribbon));
  };

  const onSubmit = (values: ProductFormValues) => {
    createProduct.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-bloomfundr-card border-bloomfundr-muted">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Product</DialogTitle>
          <DialogDescription>
            Create a new floral product for your catalog
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Classic Rose Boutonniere"
                      className="bg-bloomfundr-background border-bloomfundr-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A beautiful boutonniere featuring a single rose with greenery accents..."
                      className="bg-bloomfundr-background border-bloomfundr-muted resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-bloomfundr-background border-bloomfundr-muted">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="boutonniere">Boutonniere</SelectItem>
                        <SelectItem value="corsage">Corsage</SelectItem>
                        <SelectItem value="bouquet">Bouquet</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Price Point *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="15.00"
                          className="bg-bloomfundr-background border-bloomfundr-muted pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      This is what you'll receive for each sale. Price it as low as you're 
                      willing — this is a fundraiser and a marketing opportunity, not a retail sale!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ProductImageUpload
              value={form.watch("image_url") || null}
              onChange={(url) => form.setValue("image_url", url)}
              disabled={createProduct.isPending}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-bloomfundr-muted p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription className="text-xs">
                      Make this product available for campaigns
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Customization Options */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium text-foreground">Customization Options</h4>
              
              {/* Color Options */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Color Options</label>
                <div className="flex gap-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g., Red, White, Pink"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColorOption();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addColorOption}
                    className="shrink-0 border-bloomfundr-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {colorOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <Badge
                        key={color}
                        variant="secondary"
                        className="gap-1 bg-bloomfundr-primary/10 text-bloomfundr-primary"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColorOption(color)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Ribbon Options */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Ribbon Color Options</label>
                <div className="flex gap-2">
                  <Input
                    value={newRibbon}
                    onChange={(e) => setNewRibbon(e.target.value)}
                    placeholder="e.g., Gold, Silver, Navy"
                    className="bg-bloomfundr-background border-bloomfundr-muted"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRibbonOption();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addRibbonOption}
                    className="shrink-0 border-bloomfundr-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {ribbonOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ribbonOptions.map((ribbon) => (
                      <Badge
                        key={ribbon}
                        variant="secondary"
                        className="gap-1 bg-bloomfundr-secondary/10 text-bloomfundr-secondary"
                      >
                        {ribbon}
                        <button
                          type="button"
                          onClick={() => removeRibbonOption(ribbon)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-bloomfundr-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProduct.isPending}
                className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light"
              >
                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
