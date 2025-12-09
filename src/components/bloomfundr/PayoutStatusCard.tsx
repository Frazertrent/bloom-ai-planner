import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Clock, CheckCircle, AlertCircle, Store, Building2 } from "lucide-react";
import type { Payout } from "@/hooks/useCampaignPayouts";

interface PayoutStatusCardProps {
  campaignStatus: string;
  floristPayout: Payout | null;
  orgPayout: Payout | null;
  floristTotal: number;
  orgTotal: number;
  onCreatePayouts: () => void;
  isCreating: boolean;
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function PayoutStatusCard({
  campaignStatus,
  floristPayout,
  orgPayout,
  floristTotal,
  orgTotal,
  onCreatePayouts,
  isCreating,
  isLoading,
}: PayoutStatusCardProps) {
  const canProcessPayouts = campaignStatus === "closed" || campaignStatus === "fulfilled";
  const hasNoPayouts = !floristPayout && !orgPayout;
  const allPayoutsComplete =
    floristPayout?.status === "completed" && orgPayout?.status === "completed";

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payout Status
        </CardTitle>
        <CardDescription>
          {allPayoutsComplete
            ? "All payouts have been processed"
            : hasNoPayouts
            ? "Payout records have not been created yet"
            : "Track the status of payouts for this campaign"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payout Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Florist Payout */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Florist</span>
              </div>
              {floristPayout ? (
                <PayoutBadge status={floristPayout.status} />
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not Created
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">
              ${floristPayout ? floristPayout.amount.toFixed(2) : floristTotal.toFixed(2)}
            </p>
            {floristPayout?.processed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Processed: {new Date(floristPayout.processed_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Organization Payout */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Organization</span>
              </div>
              {orgPayout ? (
                <PayoutBadge status={orgPayout.status} />
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not Created
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">
              ${orgPayout ? orgPayout.amount.toFixed(2) : orgTotal.toFixed(2)}
            </p>
            {orgPayout?.processed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Processed: {new Date(orgPayout.processed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {hasNoPayouts && (
          <div className="pt-4 border-t">
            {canProcessPayouts ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ready to create payout records for this campaign
                </p>
                <Button onClick={onCreatePayouts} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Payout Records"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Campaign must be closed or fulfilled before payouts can be created.
              </p>
            )}
          </div>
        )}

        {!hasNoPayouts && !allPayoutsComplete && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Payouts will be processed automatically via Stripe Connect once configured.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PayoutBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
