import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  Users,
  Search,
  UserPlus,
  Check,
  Link as LinkIcon,
  Copy,
  Share2,
  ExternalLink,
} from "lucide-react";
import { generateSellerJoinLink } from "@/lib/linkGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useOrgStudentsForCampaign,
  useStudentSelection,
  useSaveCampaignStudents,
  useCampaignStudents,
} from "@/hooks/useCampaignStudents";
import { AddStudentDialog } from "@/components/bloomfundr/AddStudentDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Step4StudentsProps {
  campaignId: string;
  trackingMode: 'none' | 'individual' | 'self_register';
  onBack: () => void;
  onContinue: () => void;
}

export function Step4Students({ campaignId, trackingMode, onBack, onContinue }: Step4StudentsProps) {
  const { toast } = useToast();
  
  // Fetch campaign data for self-registration code
  const { data: campaign } = useQuery({
    queryKey: ["bf-campaign-for-step4", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bf_campaigns")
        .select("self_register_code, name")
        .eq("id", campaignId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: trackingMode === 'self_register',
  });

  // Only fetch students for 'individual' mode
  const { data: students, isLoading } = useOrgStudentsForCampaign();
  const { data: campaignStudents } = useCampaignStudents(campaignId);
  const saveStudents = useSaveCampaignStudents();

  const {
    selectedStudentIds,
    toggleStudent,
    selectAll,
    deselectAll,
    isStudentSelected,
    existingStudentIds,
  } = useStudentSelection(campaignId);

  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLinksPreview, setShowLinksPreview] = useState(false);

  // Get unique team/groups for filter
  const teamGroups = useMemo(() => {
    if (!students) return [];
    const groups = new Set(students.map((s) => s.team_group).filter(Boolean));
    return Array.from(groups) as string[];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === "" ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTeam =
        teamFilter === "all" || student.team_group === teamFilter;
      
      return matchesSearch && matchesTeam;
    });
  }, [students, searchQuery, teamFilter]);

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      deselectAll();
    } else {
      selectAll(filteredStudents.map((s) => s.id));
    }
  };

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => isStudentSelected(s.id));

  const handleSaveAndContinue = async () => {
    if (trackingMode === 'individual') {
      await saveStudents.mutateAsync({
        campaignId,
        studentIds: selectedStudentIds,
        existingStudentIds,
      });
    }
    onContinue();
  };

  const handleBack = async () => {
    // Save current selections before going back (only for individual mode)
    if (trackingMode === 'individual' && selectedStudentIds.length > 0) {
      await saveStudents.mutateAsync({
        campaignId,
        studentIds: selectedStudentIds,
        existingStudentIds,
      });
    }
    onBack();
  };

  const getSelectedStudentNames = () => {
    if (!students) return [];
    return students
      .filter((s) => selectedStudentIds.includes(s.id))
      .map((s) => s.name);
  };

  // Get magic links for preview
  const getMagicLinks = () => {
    if (!campaignStudents) return [];
    return campaignStudents
      .filter((cs) => selectedStudentIds.includes(cs.student_id))
      .map((cs) => {
        const student = students?.find((s) => s.id === cs.student_id);
        return {
          studentName: student?.name || "Unknown",
          magicLinkCode: cs.magic_link_code,
        };
      });
  };

  // Build self-registration URL
  const selfRegisterUrl = campaign?.self_register_code 
    ? generateSellerJoinLink(campaign.self_register_code)
    : null;

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "The link has been copied to your clipboard.",
    });
  };

  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Join our fundraiser: ${campaign?.name}`,
          url: url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink(url);
    }
  };

  // Self-Registration Mode UI
  if (trackingMode === 'self_register') {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Self-Registration Enabled</h3>
          <p className="text-muted-foreground">
            Sellers can sign themselves up using the link below. They'll automatically get their unique selling links.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration Link</CardTitle>
            <CardDescription>
              Share this link with your group so sellers can sign up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selfRegisterUrl ? (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={selfRegisterUrl}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(selfRegisterUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShare(selfRegisterUrl, `Join ${campaign?.name}`)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Link
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(selfRegisterUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading registration link...
              </div>
            )}
          </CardContent>
        </Card>

        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Once sellers register, you'll be able to see them and their sales on the campaign detail page after launch.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={handleSaveAndContinue}>
            Continue to Review
          </Button>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </div>
      </div>
    );
  }

  // Individual Mode - Student Selection UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Sellers Added Yet</h3>
        <p className="text-muted-foreground mb-4">
          Add sellers to your organization, or you can skip this step and add them later.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Seller
          </Button>
          <Button onClick={onContinue}>
            Skip for Now
          </Button>
        </div>
        <AddStudentDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Student List */}
      <div className="flex-1 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teamGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Seller
          </Button>
        </div>

        {/* Students Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <div 
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 cursor-pointer"
                    onClick={handleSelectAll}
                  >
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                  </div>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Team/Group</TableHead>
                <TableHead className="text-right">Previous Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => toggleStudent(student.id)}
                >
                  <TableCell className="w-16">
                    <div 
                      className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStudent(student.id);
                      }}
                    >
                      <Checkbox
                        checked={isStudentSelected(student.id)}
                        onCheckedChange={() => {}}
                        className="pointer-events-none"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.name}
                    {student.grade && (
                      <span className="text-muted-foreground ml-2 text-sm">
                        ({student.grade})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.team_group ? (
                      <Badge variant="outline">{student.team_group}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    ${student.total_sales.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No sellers match your search.
          </div>
        )}
      </div>

      {/* Selection Sidebar */}
      <div className="lg:w-80 shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudentIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Click on sellers to add them to this campaign.
              </p>
            ) : (
              <>
                <ScrollArea className="h-40 mb-4">
                  <ul className="space-y-2">
                    {getSelectedStudentNames().map((name, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{name}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total selected</span>
                  <Badge>{selectedStudentIds.length}</Badge>
                </div>

                {/* Links Preview Toggle */}
                {existingStudentIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                    onClick={() => setShowLinksPreview(!showLinksPreview)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {showLinksPreview ? "Hide" : "Preview"} Magic Links
                  </Button>
                )}

                {showLinksPreview && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium mb-2">Magic Link Codes:</p>
                    <div className="space-y-1">
                      {getMagicLinks().map((link, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{link.studentName}:</span>{" "}
                          <code className="bg-background px-1 rounded">
                            {link.magicLinkCode}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={saveStudents.isPending}
                onClick={handleSaveAndContinue}
              >
                {saveStudents.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedStudentIds.length === 0 ? "Skip for Now" : "Review Campaign"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={saveStudents.isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddStudentDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}