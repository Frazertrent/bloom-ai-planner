import { useState } from "react";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddStudentDialog } from "@/components/bloomfundr/AddStudentDialog";
import { EditStudentDialog } from "@/components/bloomfundr/EditStudentDialog";
import { StudentDetailSheet } from "@/components/bloomfundr/StudentDetailSheet";
import { 
  useOrgStudentsList, 
  useTeamGroups, 
  useDeleteStudent,
  useToggleStudentStatus
} from "@/hooks/useOrgStudents";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { 
  Users, 
  Plus, 
  Upload, 
  Eye, 
  Pencil, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  Info
} from "lucide-react";
import type { BFStudent } from "@/types/bloomfundr";

interface StudentWithSales extends BFStudent {
  total_sales: number;
  order_count: number;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function OrgStudents() {
  const { getFilter, getArrayFilter, setFilter, setArrayFilter } = useUrlFilters({
    defaultValues: { team: "all" },
  });

  const search = getFilter("search");
  const teamFilter = getFilter("team") || "all";
  const statusFilter = getArrayFilter("status");

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<BFStudent | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentWithSales | null>(null);
  const [deleteStudentState, setDeleteStudentState] = useState<BFStudent | null>(null);

  const { data: allStudents, isLoading } = useOrgStudentsList(search, teamFilter === "all" ? undefined : teamFilter);
  const { data: teamGroups } = useTeamGroups();
  const deleteStudentMutation = useDeleteStudent();
  const toggleStatus = useToggleStudentStatus();

  // Apply client-side status filtering
  const students = allStudents?.filter((student) => {
    if (statusFilter.length > 0) {
      const isActive = student.is_active;
      const matchesStatus =
        (statusFilter.includes("active") && isActive) ||
        (statusFilter.includes("inactive") && !isActive);
      if (!matchesStatus) return false;
    }
    return true;
  });

  const handleDelete = () => {
    if (!deleteStudentState) return;
    deleteStudentMutation.mutate(deleteStudentState.id);
    setDeleteStudentState(null);
  };

  const handleToggleStatus = (student: BFStudent) => {
    toggleStatus.mutate({ 
      studentId: student.id, 
      isActive: !student.is_active 
    });
  };

  return (
    <OrgLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sellers</h1>
            <p className="text-muted-foreground mt-1">
              Manage sellers participating in your fundraisers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Seller
            </Button>
          </div>
        </div>

        {/* Helper Tip */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/50">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-medium">Tip:</span> You don't need to add sellers here first. When creating a campaign, you can choose self-registration and let sellers sign themselves up.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={search}
            onChange={(v) => setFilter("search", v)}
            placeholder="Search by name, email, or phone..."
            className="flex-1 max-w-sm"
          />
          <Select value={teamFilter} onValueChange={(v) => setFilter("team", v)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Teams</SelectItem>
              {teamGroups?.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => setArrayFilter("status", v)}
            multiSelect
          />
        </div>

        {/* Sellers Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Sellers</CardTitle>
            <CardDescription>
              {students?.length || 0} sellers in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Grade</TableHead>
                      <TableHead className="hidden md:table-cell">Team/Group</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <button
                            onClick={() => setViewStudent(student)}
                            className="font-medium text-primary hover:underline text-left"
                          >
                            {student.name}
                          </button>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{student.email || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{student.phone || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.grade || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">{student.team_group || "—"}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          ${student.total_sales.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.is_active ? "default" : "secondary"}>
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewStudent(student)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditStudent(student)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(student)}
                              title={student.is_active ? "Deactivate" : "Activate"}
                            >
                              {student.is_active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteStudentState(student)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {search || statusFilter.length > 0 || teamFilter !== "all"
                    ? "No sellers match your filters"
                    : "No sellers yet"}
                </p>
                <p className="text-sm mt-1 max-w-md mx-auto">
                  {search || statusFilter.length > 0 || teamFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Sellers will appear here as they participate in campaigns. You can also pre-add sellers if you want to assign them to campaigns manually."}
                </p>
                {!search && statusFilter.length === 0 && teamFilter === "all" && (
                  <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Seller
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <AddStudentDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />

      {/* Edit Dialog */}
      <EditStudentDialog
        student={editStudent}
        open={!!editStudent}
        onOpenChange={(open) => !open && setEditStudent(null)}
      />

      {/* View Sheet */}
      <StudentDetailSheet
        student={viewStudent}
        open={!!viewStudent}
        onOpenChange={(open) => !open && setViewStudent(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteStudentState} onOpenChange={(open) => !open && setDeleteStudentState(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Seller?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteStudentState?.name}</strong>?
              {deleteStudentState && (students?.find(s => s.id === deleteStudentState.id)?.total_sales || 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ This seller has sales history. They will be marked as inactive but their sales data will be preserved.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Seller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OrgLayout>
  );
}
