import { Badge } from "@/components/ui/badge";
import type { CampaignStatus } from "@/types/bloomfundr";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

const statusConfig: Record<CampaignStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20",
  },
  fulfilled: {
    label: "Fulfilled",
    className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20",
  },
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
