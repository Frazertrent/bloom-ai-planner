import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  DollarSign,
  CreditCard,
  Banknote,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PaymentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  studentName: string | null;
  total: number;
  subtotal: number;
  paymentStatus: string;
  entryMethod: string;
  createdAt: string;
  notes: string | null;
}

interface CampaignPaymentsTabProps {
  campaignId: string;
  orders: PaymentOrder[];
  orgMarginPercent: number;
}

export function CampaignPaymentsTab({
  campaignId,
  orders,
  orgMarginPercent,
}: CampaignPaymentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "check">("cash");
  const [checkNumber, setCheckNumber] = useState("");
  const [collectedBy, setCollectedBy] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Calculate payment stats
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");

  const totalExpected = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCollectedOnline = paidOrders
    .filter((o) => o.entryMethod === "online")
    .reduce((sum, o) => sum + o.total, 0);
  const totalCollectedOffline = paidOrders
    .filter((o) => o.entryMethod === "manual")
    .reduce((sum, o) => sum + o.total, 0);
  const outstandingBalance = pendingOrders.reduce((sum, o) => sum + o.total, 0);

  // Filter orders for collected payments table
  const filteredPaidOrders = paidOrders.filter((o) => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "online") return o.entryMethod === "online";
    if (paymentFilter === "offline") return o.entryMethod === "manual";
    return true;
  });

  // Mark paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async ({
      orderId,
      method,
      checkNum,
      collector,
      notes,
    }: {
      orderId: string;
      method: "cash" | "check";
      checkNum?: string;
      collector?: string;
      notes?: string;
    }) => {
      // Build payment note
      const paymentDetails = [
        `Payment collected: ${method.toUpperCase()}`,
        checkNum && `Check #: ${checkNum}`,
        collector && `Collected by: ${collector}`,
        `Date: ${format(new Date(), "MMM d, yyyy h:mm a")}`,
        notes,
      ]
        .filter(Boolean)
        .join("\n");

      const { error } = await supabase
        .from("bf_orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          notes: paymentDetails,
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["org-campaign-payments", campaignId] });
      toast({ title: "Payment recorded", description: "Order marked as paid." });
      setSelectedOrder(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPaymentMethod("cash");
    setCheckNumber("");
    setCollectedBy("");
    setPaymentNotes("");
  };

  const handleMarkPaid = () => {
    if (!selectedOrder) return;
    markPaidMutation.mutate({
      orderId: selectedOrder.id,
      method: paymentMethod,
      checkNum: checkNumber || undefined,
      collector: collectedBy || undefined,
      notes: paymentNotes || undefined,
    });
  };

  const handleExportReconciliation = () => {
    const headers = [
      "Order #",
      "Customer",
      "Student",
      "Amount",
      "Payment Status",
      "Entry Method",
      "Date",
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.studentName || "—",
      `$${o.total.toFixed(2)}`,
      o.paymentStatus,
      o.entryMethod,
      format(new Date(o.createdAt), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Payment Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expected</p>
                <p className="text-2xl font-bold">${totalExpected.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected Online</p>
                <p className="text-2xl font-bold">${totalCollectedOnline.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected Offline</p>
                <p className="text-2xl font-bold">${totalCollectedOffline.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${outstandingBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Payments */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Outstanding Payments
              </CardTitle>
              <CardDescription>
                {pendingOrders.length} orders awaiting payment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.studentName || "—"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.entryMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Mark Paid
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p>All payments collected!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collected Payments */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Collected Payments
              </CardTitle>
              <CardDescription>
                {paidOrders.length} payments received
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Cash/Check</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReconciliation}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPaidOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaidOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.studentName || "—"}</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          order.entryMethod === "online"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {order.entryMethod === "online" ? "Online" : "Cash/Check"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payments collected yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark Paid Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Mark order {selectedOrder?.orderNumber} as paid
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium">{selectedOrder.studentName || "—"}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold">Amount Due</span>
                  <span className="text-lg font-bold">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cash" | "check")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="dialog-cash" />
                    <Label htmlFor="dialog-cash" className="cursor-pointer">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="check" id="dialog-check" />
                    <Label htmlFor="dialog-check" className="cursor-pointer">
                      Check
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "check" && (
                <div className="space-y-2">
                  <Label htmlFor="checkNumber">Check Number</Label>
                  <Input
                    id="checkNumber"
                    placeholder="Enter check number"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="collectedBy">Collected By</Label>
                <Input
                  id="collectedBy"
                  placeholder="Staff name"
                  value={collectedBy}
                  onChange={(e) => setCollectedBy(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Notes (optional)</Label>
                <Textarea
                  id="paymentNotes"
                  placeholder="Any additional notes..."
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
