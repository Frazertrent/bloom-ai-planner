// src/components/events/EventTeam.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus,
  Edit,
  Save,
  X,
  Loader2,
  Users,
  Clock,
  DollarSign,
  Calendar,
  UserCheck,
  Trash2,
  AlertCircle,
  Calculator,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventTeamProps {
  eventId: string;
}

interface StaffAssignment {
  id?: string;
  user_id?: string;
  role: 'lead_designer' | 'assistant' | 'driver' | 'setup_crew' | 'other';
  hourly_rate?: number;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  user_name?: string;
  user_email?: string;
}

interface StaffAvailability {
  user_id: string;
  available_date: string;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  default_rate?: number;
}

const ROLE_OPTIONS = [
  { value: 'lead_designer', label: 'Lead Designer', color: 'bg-purple-100 text-purple-800', icon: '👨‍🎨' },
  { value: 'assistant', label: 'Assistant', color: 'bg-blue-100 text-blue-800', icon: '🤝' },
  { value: 'driver', label: 'Driver', color: 'bg-green-100 text-green-800', icon: '🚗' },
  { value: 'setup_crew', label: 'Setup Crew', color: 'bg-yellow-100 text-yellow-800', icon: '🔧' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800', icon: '👤' }
];

const EventTeam = ({ eventId }: EventTeamProps) => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<StaffAvailability[]>([]);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StaffAssignment | null>(null);
  const [newAssignment, setNewAssignment] = useState<StaffAssignment>({
    role: 'assistant',
    hourly_rate: 25,
    estimated_hours: 8
  });
  const [showAvailability, setShowAvailability] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [eventId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Fetch event date
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('event_date')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (eventData?.event_date) {
        setEventDate(eventData.event_date);
      }

      // Fetch staff assignments - using event_team_assignments table
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('event_team_assignments')
        .select('*')
        .eq('event_id', eventId);

      if (assignmentsError && assignmentsError.code !== 'PGRST116') {
        throw assignmentsError;
      }

      setAssignments((assignmentsData || []) as unknown as StaffAssignment[]);

      // Fetch organization team members
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          const { data: members } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, email')
            .eq('organization_id', profile.organization_id);

          if (members) {
            setTeamMembers(members.map(m => ({
              ...m,
              default_rate: 25 // Default rate, should come from user settings
            })));
          }
        }
      }

      // Fetch availability for event date if set - skip for now as table may not exist
      // if (eventData?.event_date) {
      //   const { data: availData } = await supabase
      //     .from('staff_availability')
      //     .select('*')
      //     .eq('available_date', eventData.event_date.split('T')[0]);

      //   if (availData) {
      //     setAvailability(availData);
      //   }
      // }

    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAssignment = async () => {
    try {
      const assignmentData = {
        ...newAssignment,
        event_id: eventId
      };

      if (editingAssignment?.id) {
        // Update existing assignment
        const { error } = await supabase
          .from('event_team_assignments')
          .update(assignmentData as any)
          .eq('id', editingAssignment.id);

        if (error) throw error;
      } else {
        // Check if this person is already assigned to this role
        if (newAssignment.user_id) {
          const existing = assignments.find(
            a => a.user_id === newAssignment.user_id && a.role === newAssignment.role
          );
          
          if (existing) {
            toast({
              title: 'Warning',
              description: 'This team member is already assigned to this role',
              variant: 'destructive'
            });
            return;
          }
        }

        // Create new assignment
        const { error } = await supabase
          .from('event_team_assignments')
          .insert(assignmentData as any);

        if (error) throw error;
      }

      await fetchTeamData();
      setIsAddingAssignment(false);
      setEditingAssignment(null);
      setNewAssignment({
        role: 'assistant',
        hourly_rate: 25,
        estimated_hours: 8
      });

      toast({
        title: 'Success',
        description: editingAssignment ? 'Assignment updated' : 'Team member assigned'
      });
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save assignment',
        variant: 'destructive'
      });
    }
  };

  const updateActualHours = async (assignmentId: string, hours: number) => {
    try {
      const { error } = await supabase
        .from('event_team_assignments')
        .update({ actual_hours: hours })
        .eq('id', assignmentId);

      if (error) throw error;

      await fetchTeamData();
      
      toast({
        title: 'Success',
        description: 'Actual hours updated'
      });
    } catch (error) {
      console.error('Error updating actual hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to update actual hours',
        variant: 'destructive'
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('event_team_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      await fetchTeamData();
      
      toast({
        title: 'Success',
        description: 'Assignment removed'
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove assignment',
        variant: 'destructive'
      });
    }
  };

  const calculateTotalLabor = () => {
    return assignments.reduce((total, assignment) => {
      const hours = assignment.actual_hours || assignment.estimated_hours || 0;
      const rate = assignment.hourly_rate || 0;
      return total + (hours * rate);
    }, 0);
  };

  const calculateLaborByRole = () => {
    const byRole: Record<string, { estimated: number; actual: number }> = {};
    
    assignments.forEach(assignment => {
      if (!byRole[assignment.role]) {
        byRole[assignment.role] = { estimated: 0, actual: 0 };
      }
      
      const estimatedCost = (assignment.estimated_hours || 0) * (assignment.hourly_rate || 0);
      const actualCost = (assignment.actual_hours || 0) * (assignment.hourly_rate || 0);
      
      byRole[assignment.role].estimated += estimatedCost;
      byRole[assignment.role].actual += actualCost;
    });
    
    return byRole;
  };

  const getTotalHours = () => {
    const estimated = assignments.reduce((sum, a) => sum + (a.estimated_hours || 0), 0);
    const actual = assignments.reduce((sum, a) => sum + (a.actual_hours || 0), 0);
    return { estimated, actual };
  };

  const getTeamMemberName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const member = teamMembers.find(m => m.id === userId);
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
  };

  const isTeamMemberAvailable = (userId: string) => {
    return availability.some(a => a.user_id === userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {getTotalHours().actual || getTotalHours().estimated}
                </p>
                <p className="text-xs text-muted-foreground">
                  Est: {getTotalHours().estimated}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">
                  ${calculateTotalLabor().toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="text-2xl font-bold">
                  {availability.length} / {teamMembers.length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Assignments */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Staff Assignments</span>
      <div className="flex gap-2">
        {eventDate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAvailability(!showAvailability)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showAvailability ? 'Hide' : 'Show'} Availability
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => {
            setEditingAssignment(null);
            setNewAssignment({
              role: 'assistant',
              hourly_rate: 25,
              estimated_hours: 8
            });
            setIsAddingAssignment(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Hourly Rate</TableHead>
          <TableHead>Est. Hours</TableHead>
          <TableHead>Actual Hours</TableHead>
          <TableHead>Cost</TableHead>
          {showAvailability && <TableHead>Available</TableHead>}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const hours = assignment.actual_hours || assignment.estimated_hours || 0;
          const cost = hours * (assignment.hourly_rate || 0);
          const roleInfo = ROLE_OPTIONS.find(r => r.value === assignment.role);
          
          return (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                {getTeamMemberName(assignment.user_id)}
              </TableCell>
              <TableCell>
                <Badge className={roleInfo?.color}>
                  <span className="mr-1">{roleInfo?.icon}</span>
                  {roleInfo?.label}
                </Badge>
              </TableCell>
              <TableCell>${assignment.hourly_rate || 0}/hr</TableCell>
              <TableCell>{assignment.estimated_hours || 0}h</TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.5"
                  value={assignment.actual_hours || ''}
                  onChange={(e) => assignment.id && updateActualHours(
                    assignment.id,
                    parseFloat(e.target.value) || 0
                  )}
                  className="w-20"
                  placeholder={assignment.estimated_hours?.toString()}
                />
              </TableCell>
              <TableCell className="font-semibold">
                ${cost.toFixed(2)}
              </TableCell>
              {showAvailability && (
                <TableCell>
                  {assignment.user_id && isTeamMemberAvailable(assignment.user_id) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </TableCell>
              )}
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingAssignment(assignment);
                      setNewAssignment(assignment);
                      setIsAddingAssignment(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => assignment.id && deleteAssignment(assignment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {assignments.length === 0 && (
          <TableRow>
            <TableCell colSpan={showAvailability ? 8 : 7} className="text-center text-muted-foreground">
              No staff assigned yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </CardContent>
</Card>

      {/* Labor Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Labor Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(calculateLaborByRole()).map(([role, costs]) => {
              const roleInfo = ROLE_OPTIONS.find(r => r.value === role);
              const displayCost = costs.actual > 0 ? costs.actual : costs.estimated;
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={roleInfo?.color}>
                      <span className="mr-1">{roleInfo?.icon}</span>
                      {roleInfo?.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${displayCost.toFixed(2)}</p>
                    {costs.actual > 0 && costs.actual !== costs.estimated && (
                      <p className="text-xs text-muted-foreground">
                        Est: ${costs.estimated.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Total Labor Cost</p>
                <p className="text-xl font-bold">
                  ${calculateTotalLabor().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Assignment Dialog */}
      <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? 'Edit Assignment' : 'Add Staff Assignment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team Member</Label>
              <Select
                value={newAssignment.user_id || ''}
                onValueChange={(value) => {
                  const member = teamMembers.find(m => m.id === value);
                  setNewAssignment({ 
                    ...newAssignment, 
                    user_id: value,
                    hourly_rate: member?.default_rate || newAssignment.hourly_rate
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                      {isTeamMemberAvailable(member.id) && ' ✓'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={newAssignment.role}
                onValueChange={(value) => setNewAssignment({ 
                  ...newAssignment, 
                  role: value as StaffAssignment['role'] 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="flex items-center gap-2">
                        <span>{role.icon}</span>
                        {role.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  step="0.50"
                  value={newAssignment.hourly_rate || ''}
                  onChange={(e) => setNewAssignment({
                    ...newAssignment,
                    hourly_rate: parseFloat(e.target.value) || 0
                  })}
                  placeholder="25.00"
                />
              </div>
              <div>
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newAssignment.estimated_hours || ''}
                  onChange={(e) => setNewAssignment({
                    ...newAssignment,
                    estimated_hours: parseFloat(e.target.value) || 0
                  })}
                  placeholder="8"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newAssignment.notes || ''}
                onChange={(e) => setNewAssignment({
                  ...newAssignment,
                  notes: e.target.value
                })}
                placeholder="Special instructions, arrival time, responsibilities..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingAssignment(false);
                  setEditingAssignment(null);
                  setNewAssignment({
                    role: 'assistant',
                    hourly_rate: 25,
                    estimated_hours: 8
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveAssignment}>
                <Save className="w-4 h-4 mr-2" />
                {editingAssignment ? 'Update' : 'Add'} Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventTeam;