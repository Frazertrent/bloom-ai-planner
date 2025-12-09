import { useState } from "react";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  Users, 
  Plus, 
  Upload, 
  Search, 
  Eye, 
  Pencil, 
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import type { BFStudent } from "@/types/bloomfundr";

interface StudentWithSales extends BFStudent {
  total_sales: number;
  order_count: number;
}

export default function OrgStudents() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<BFStudent | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentWithSales | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<BFStudent | null>(null);

  const { data: students, isLoading } = useOrgStudentsList(search, teamFilter);
  const { data: teamGroups } = useTeamGroups();
  const deleteStudentMutation = useDeleteStudent();
  const toggleStatus = useToggleStudentStatus();

  const handleDelete = () => {
    if (!deleteStudent) return;
    deleteStudentMutation.mutate(deleteStudent.id);
    setDeleteStudent(null);
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
            <h1 className="text-3xl font-bold text-foreground">Students & Sellers</h1>
            <p className="text-muted-foreground mt-1">
              Manage students participating in your fundraisers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teamGroups?.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              {students?.length || 0} students in your organization
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Team/Group</TableHead>
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
                      <TableCell>{student.email || "—"}</TableCell>
                      <TableCell>{student.phone || "—"}</TableCell>
                      <TableCell>{student.grade || "—"}</TableCell>
                      <TableCell>{student.team_group || "—"}</TableCell>
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
                            onClick={() => setDeleteStudent(student)}
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
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No students yet</p>
                <p className="text-sm mt-1">Add students to participate in campaigns</p>
                <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Student
                </Button>
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
      <AlertDialog open={!!deleteStudent} onOpenChange={(open) => !open && setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteStudent?.name}</strong>?
              {deleteStudent && (students?.find(s => s.id === deleteStudent.id)?.total_sales || 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ This student has sales history. They will be marked as inactive but their sales data will be preserved.
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
              Remove Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OrgLayout>
  );
}
