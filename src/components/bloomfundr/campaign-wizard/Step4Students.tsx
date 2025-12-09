import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  Users,
  Search,
  UserPlus,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

interface Step4StudentsProps {
  campaignId: string;
  onBack: () => void;
  onContinue: () => void;
}

export function Step4Students({ campaignId, onBack, onContinue }: Step4StudentsProps) {
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
    await saveStudents.mutateAsync({
      campaignId,
      studentIds: selectedStudentIds,
      existingStudentIds,
    });
    onContinue();
  };

  const handleBack = async () => {
    // Save current selections before going back
    await saveStudents.mutateAsync({
      campaignId,
      studentIds: selectedStudentIds,
      existingStudentIds,
    });
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
        <h3 className="text-lg font-medium mb-2">No Students Added</h3>
        <p className="text-muted-foreground mb-4">
          Add students to your organization first.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
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
              placeholder="Search students..."
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
            Add Student
          </Button>
        </div>

        {/* Students Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
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
                  <TableCell>
                    <Checkbox
                      checked={isStudentSelected(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
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
            No students match your search.
          </div>
        )}
      </div>

      {/* Selection Sidebar */}
      <div className="lg:w-80 shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudentIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Click on students to add them to this campaign.
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
                disabled={selectedStudentIds.length === 0 || saveStudents.isPending}
                onClick={handleSaveAndContinue}
              >
                {saveStudents.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Review Campaign
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
