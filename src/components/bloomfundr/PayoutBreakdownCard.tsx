import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CreditCard, Building2, Store } from "lucide-react";
import type { PayoutBreakdown } from "@/lib/payoutCalculator";

interface PayoutBreakdownCardProps {
  breakdown: PayoutBreakdown;
  floristMarginPercent: number;
  orgMarginPercent: number;
  platformFeePercent: number;
}

export function PayoutBreakdownCard({
  breakdown,
  floristMarginPercent,
  orgMarginPercent,
  platformFeePercent,
}: PayoutBreakdownCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payout Breakdown
        </CardTitle>
        <CardDescription>
          How revenue from {breakdown.orderPayouts.length} paid orders is distributed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Revenue */}
        <div className="flex justify-between items-center py-3 border-b">
          <span className="text-lg text-muted-foreground">Total Revenue</span>
          <span className="text-2xl font-bold">${breakdown.totalRevenue.toFixed(2)}</span>
        </div>

        {/* Deductions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Deductions
          </h4>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Payment Processing Fees (~3%)</span>
            </div>
            <span className="font-medium text-muted-foreground">
              -${breakdown.totalProcessingFees.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Platform Fee ({platformFeePercent}%)</span>
            </div>
            <span className="font-medium text-muted-foreground">
              -${breakdown.totalPlatformFees.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Net Available */}
        <div className="flex justify-between items-center py-3 border-y">
          <span className="text-muted-foreground">Net Available for Distribution</span>
          <span className="text-xl font-semibold">
            ${(breakdown.floristTotal + breakdown.orgTotal).toFixed(2)}
          </span>
        </div>

        {/* Payouts */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Florist Payout</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ${breakdown.floristTotal.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {floristMarginPercent}% margin
            </p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Organization Payout</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ${breakdown.orgTotal.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {orgMarginPercent}% margin
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
