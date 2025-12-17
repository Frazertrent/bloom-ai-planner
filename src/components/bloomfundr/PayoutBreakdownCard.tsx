import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CreditCard, Building2, Store } from "lucide-react";
import type { PayoutBreakdown } from "@/lib/payoutCalculator";

interface PayoutBreakdownCardProps {
  breakdown: PayoutBreakdown;
  floristMarginPercent: number;
  orgMarginPercent: number;
  platformFeePercent: number;
  viewType: "florist" | "organization";
}

export function PayoutBreakdownCard({
  breakdown,
  floristMarginPercent,
  orgMarginPercent,
  platformFeePercent,
  viewType,
}: PayoutBreakdownCardProps) {
  const isFlorist = viewType === "florist";
  const yourTotal = isFlorist ? breakdown.floristTotal : breakdown.orgTotal;
  const yourMarginPercent = isFlorist ? floristMarginPercent : orgMarginPercent;
  const Icon = isFlorist ? Store : Building2;
  const colorClass = isFlorist ? "text-emerald-600" : "text-blue-600";
  const bgClass = isFlorist ? "bg-emerald-500/10 border-emerald-500/20" : "bg-blue-500/10 border-blue-500/20";

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payout Summary
        </CardTitle>
        <CardDescription>
          Earnings from {breakdown.orderPayouts.length} paid orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Revenue */}
        <div className="flex justify-between items-center py-3 border-b">
          <span className="text-lg text-muted-foreground">Total Sales</span>
          <span className="text-2xl font-bold">${breakdown.totalRevenue.toFixed(2)}</span>
        </div>

        {/* Your Payout */}
        <div className={`p-6 rounded-lg border text-center ${bgClass}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <span className="text-sm text-muted-foreground">Your Payout</span>
          </div>
          <p className={`text-4xl font-bold ${colorClass}`}>
            ${yourTotal.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Based on {yourMarginPercent}% margin
          </p>
        </div>

        {/* Deductions Note */}
        <p className="text-xs text-muted-foreground text-center">
          Net of payment processing fees (~3%) and platform fee ({platformFeePercent}%)
        </p>
      </CardContent>
    </Card>
  );
}
