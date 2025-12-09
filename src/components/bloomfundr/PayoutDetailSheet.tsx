import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OrderPayout, PayoutBreakdown } from "@/lib/payoutCalculator";

interface PayoutDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: PayoutBreakdown | null;
  viewType: "florist" | "organization";
  floristMarginPercent: number;
  orgMarginPercent: number;
}

export function PayoutDetailSheet({
  open,
  onOpenChange,
  breakdown,
  viewType,
  floristMarginPercent,
  orgMarginPercent,
}: PayoutDetailSheetProps) {
  if (!breakdown) return null;

  const total = viewType === "florist" ? breakdown.floristTotal : breakdown.orgTotal;
  const marginPercent = viewType === "florist" ? floristMarginPercent : orgMarginPercent;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {viewType === "florist" ? "Florist" : "Organization"} Payout Details
          </SheetTitle>
          <SheetDescription>
            Order-by-order breakdown of the {marginPercent}% margin payout
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{breakdown.orderPayouts.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payout</p>
                <p className="text-2xl font-bold text-emerald-600">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div>
            <h4 className="font-medium mb-3">Order Breakdown</h4>
            {breakdown.orderPayouts.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Fees</TableHead>
                      <TableHead className="text-right">Your Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown.orderPayouts.map((order) => {
                      const share =
                        viewType === "florist" ? order.floristPayout : order.orgPayout;
                      const totalFees = order.processingFee + order.platformFee;

                      return (
                        <TableRow key={order.orderId}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-right">
                            ${order.subtotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            -${totalFees.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600">
                            ${share.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No paid orders yet
              </div>
            )}
          </div>

          {/* Calculation Explanation */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium mb-2">How it's calculated</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                1. Start with order subtotal
              </li>
              <li>
                2. Subtract payment processing fee (~3%)
              </li>
              <li>
                3. Subtract platform fee (10%)
              </li>
              <li>
                4. Split remaining amount based on margin percentages
              </li>
              <li>
                5. Your share: {marginPercent}% of the distributed amount
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
