import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useOrgCampaignAnalytics } from "@/hooks/useOrgCampaignAnalytics";
import { useCreateManualOrder, ManualOrderItem } from "@/hooks/useManualOrder";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";

const customerFormSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  paymentMethod: z.enum(["cash", "check", "online"]),
  paymentCollected: z.boolean(),
  amountCollected: z.number().optional(),
  collectedBy: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface OrderLineItem extends ManualOrderItem {
  id: string;
}

export default function ManualOrderEntry() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: analytics, isLoading } = useOrgCampaignAnalytics(campaignId);
  const createOrderMutation = useCreateManualOrder();

  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [orderCreated, setOrderCreated] = useState<{ orderId: string; orderNumber: string } | null>(
    null
  );

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      studentId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      paymentMethod: "cash",
      paymentCollected: false,
      amountCollected: undefined,
      collectedBy: "",
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const paymentCollected = form.watch("paymentCollected");

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [orderItems]);

  const addProduct = (productId: string) => {
    if (!analytics) return;

    const product = analytics.products.find((p) => p.id === productId);
    if (!product) return;

    // Check if product already exists
    const existing = orderItems.find((item) => item.campaignProductId === product.id);
    if (existing) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.campaignProductId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      return;
    }

    const newItem: OrderLineItem = {
      id: crypto.randomUUID(),
      campaignProductId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.retailPrice,
    };

    setOrderItems((prev) => [...prev, newItem]);
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItemRecipient = (itemId: string, recipientName: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, recipientName } : item
      )
    );
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (orderItems.length === 0) {
      toast({
        title: "No products selected",
        description: "Please add at least one product to the order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        campaignId: campaignId!,
        studentId: data.studentId,
        customerName: data.customerName,
        customerEmail: data.customerEmail || undefined,
        customerPhone: data.customerPhone,
        items: orderItems,
        paymentMethod: data.paymentMethod,
        paymentCollected: data.paymentCollected,
        amountCollected: data.amountCollected,
        collectedBy: data.collectedBy,
        notes: data.notes,
      });

      setOrderCreated(result);
      toast({
        title: "Order created",
        description: `Order ${result.orderNumber} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAnother = () => {
    setOrderCreated(null);
    setOrderItems([]);
    form.reset();
  };

  if (isLoading) {
    return (
      <OrgLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </OrgLayout>
    );
  }

  if (!analytics) {
    return (
      <OrgLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button asChild className="mt-4">
            <Link to="/org/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </OrgLayout>
    );
  }

  // Success state
  if (orderCreated) {
    return (
      <OrgLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Created!</h2>
              <p className="text-muted-foreground mb-4">
                Order <span className="font-mono font-semibold">{orderCreated.orderNumber}</span> has
                been successfully created.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={handleAddAnother}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Order
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/org/campaigns/${campaignId}`}>Back to Campaign</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </OrgLayout>
    );
  }

  const { campaign, products, students } = analytics;

  return (
    <OrgLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/org/campaigns/${campaignId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Manual Order</h1>
            <p className="text-muted-foreground">{campaign.name}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Attribution */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Student Attribution</CardTitle>
                    <CardDescription>Select the student this order is for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Products */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Add products to this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Selector */}
                    <div>
                      <Label>Add Product</Label>
                      <Select onValueChange={addProduct}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select a product to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.retailPrice.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Order Items */}
                    {orderItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No products added yet</p>
                        <p className="text-sm">Select a product above to add it</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.productName}</span>
                                <span className="font-semibold">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <Input
                                placeholder="Recipient name (optional)"
                                value={item.recipientName || ""}
                                onChange={(e) => updateItemRecipient(item.id, e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateItemQuantity(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateItemQuantity(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Collection */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Payment Collection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="cursor-pointer">
                                  Cash
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="check" id="check" />
                                <Label htmlFor="check" className="cursor-pointer">
                                  Check
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="cursor-pointer">
                                  Already Paid Online
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {paymentMethod !== "online" && (
                      <>
                        <FormField
                          control={form.control}
                          name="paymentCollected"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">Payment Collected</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        {paymentCollected && (
                          <div className="grid gap-4 md:grid-cols-2 pl-7">
                            <FormField
                              control={form.control}
                              name="amountCollected"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount Collected</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value ? parseFloat(e.target.value) : undefined
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="collectedBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Collected By</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Staff name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes for this order..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-border sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orderItems.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No items added</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.productName} × {item.quantity}
                              </span>
                              <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border pt-4">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={orderItems.length === 0 || createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </OrgLayout>
  );
}
