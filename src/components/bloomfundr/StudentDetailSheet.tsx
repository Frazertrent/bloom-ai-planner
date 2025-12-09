import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentCampaignHistory } from "@/hooks/useOrgStudents";
import { User, Mail, Phone, GraduationCap, Users, Trophy, DollarSign, ShoppingCart, Link as LinkIcon } from "lucide-react";
import type { BFStudent } from "@/types/bloomfundr";

interface StudentWithSales extends BFStudent {
  total_sales: number;
  order_count: number;
}

interface StudentDetailSheetProps {
  student: StudentWithSales | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailSheet({ student, open, onOpenChange }: StudentDetailSheetProps) {
  const { data: campaignHistory, isLoading: historyLoading } = useStudentCampaignHistory(student?.id);

  if (!student) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {student.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={student.is_active ? "default" : "secondary"}>
              {student.is_active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Code: {student.unique_code}
            </span>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Contact Information</h3>
            <div className="space-y-2">
              {student.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${student.email}`} className="hover:underline">
                    {student.email}
                  </a>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${student.phone}`} className="hover:underline">
                    {student.phone}
                  </a>
                </div>
              )}
              {student.grade && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{student.grade}</span>
                </div>
              )}
              {student.team_group && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{student.team_group}</span>
                </div>
              )}
              {!student.email && !student.phone && !student.grade && !student.team_group && (
                <p className="text-sm text-muted-foreground">No additional info provided</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Performance Stats */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Sales
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  ${student.total_sales.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {student.order_count}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Campaign History */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Campaign Participation</h3>
            {historyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : campaignHistory && campaignHistory.length > 0 ? (
              <div className="space-y-3">
                {campaignHistory.map((campaign) => (
                  <div 
                    key={campaign.campaign_id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <p className="font-medium text-foreground">{campaign.campaign_name}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {campaign.order_count} orders
                      </span>
                      <span className="font-medium text-emerald-600">
                        ${campaign.total_sales.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <LinkIcon className="h-3 w-3" />
                      <span>Magic Link: {campaign.magic_link_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No campaign participation yet
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
