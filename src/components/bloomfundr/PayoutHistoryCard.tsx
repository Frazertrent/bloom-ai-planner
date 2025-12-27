import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Clock, CheckCircle2, XCircle, ExternalLink, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { PayoutRecord } from "@/hooks/usePayoutHistory";

interface PayoutHistoryCardProps {
  payouts: PayoutRecord[];
  isLoading: boolean;
  pendingCount: number;
  hasStripeAccount: boolean;
  isProcessingPending: boolean;
  onProcessPending: () => void;
}

export function PayoutHistoryCard({
  payouts,
  isLoading,
  pendingCount,
  hasStripeAccount,
  isProcessingPending,
  onProcessPending,
}: PayoutHistoryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout History
            </CardTitle>
            <CardDescription>Track your earnings and payment status</CardDescription>
          </div>
          {pendingCount > 0 && hasStripeAccount && (
            <Button 
              onClick={onProcessPending}
              disabled={isProcessingPending}
              size="sm"
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-500/10"
            >
              {isProcessingPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" />Process {pendingCount} Pending</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No payouts yet</p>
            <p className="text-sm">Payouts will appear here once orders are placed on your campaigns.</p>
          </div>
        ) : (
          <>
            {pendingCount > 0 && !hasStripeAccount && (
              <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You have {pendingCount} pending payout{pendingCount > 1 ? "s" : ""}. Connect Stripe to receive them.
                  </span>
                </div>
              </div>
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {payout.campaign_name || "Unknown Campaign"}
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(payout.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(payout.status)}
                        <span className="text-muted-foreground">
                          {format(new Date(payout.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      {payout.stripe_transfer_id && (
                        <a
                          href={`https://dashboard.stripe.com/connect/transfers/${payout.stripe_transfer_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Transfer
                        </a>
                      )}
                    </div>
                    {payout.processed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processed: {format(new Date(payout.processed_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
