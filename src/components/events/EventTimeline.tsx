// src/components/events/EventTimeline.tsx
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
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Trash2,
  ChevronRight,
  Flag,
  Users,
  CalendarDays,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventTimelineProps {
  eventId: string;
}

interface TimelineTask {
  id?: string;
  task_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  order_by_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  dependencies?: string[];
  milestone: boolean;
  sort_order: number;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

// Default tasks template for new events
const DEFAULT_TASKS = [
  { name: 'Initial Consultation', days_before: 90, priority: 'high' },
  { name: 'Finalize Design Concept', days_before: 75, priority: 'high' },
  { name: 'Order Flowers', days_before: 14, priority: 'critical', is_order_by: true },
  { name: 'Order Rentals', days_before: 30, priority: 'high' },
  { name: 'Confirm Staff Schedule', days_before: 14, priority: 'high' },
  { name: 'Prepare Containers', days_before: 7, priority: 'medium' },
  { name: 'Process Flowers', days_before: 2, priority: 'critical' },
  { name: 'Create Arrangements', days_before: 1, priority: 'critical' },
  { name: 'Load Vehicles', days_before: 0, priority: 'high' },
  { name: 'Setup at Venue', days_before: 0, priority: 'critical' },
  { name: 'Final Walkthrough', days_before: 0, priority: 'high' },
  { name: 'Strike/Cleanup', days_before: -1, priority: 'medium' }
];

const EventTimeline = ({ eventId }: EventTimelineProps) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [orderByDate, setOrderByDate] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);
  const [newTask, setNewTask] = useState<TimelineTask>({
    task_name: '',
    status: 'pending',
    priority: 'medium',
    milestone: false,
    sort_order: 0
  });
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');

  useEffect(() => {
    fetchTimelineData();
  }, [eventId]);

  const fetchTimelineData = async () => {
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

      // Fetch timeline tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('timeline_tasks')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (tasksError && tasksError.code !== 'PGRST116') {
        throw tasksError;
      }

      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
        
        // Find the order by date
        const orderTask = tasksData.find(t => t.order_by_date);
        if (orderTask) {
          setOrderByDate(orderTask.order_by_date);
        }
      } else if (eventData?.event_date) {
        // No tasks exist, create default tasks
        await createDefaultTasks(eventData.event_date);
      }

    } catch (error) {
      console.error('Error fetching timeline data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timeline data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTasks = async (eventDateStr: string) => {
    try {
      const eventDateObj = new Date(eventDateStr);
      const tasksToCreate = DEFAULT_TASKS.map((template, index) => {
        const taskDate = new Date(eventDateObj);
        taskDate.setDate(taskDate.getDate() - template.days_before);
        
        return {
          event_id: eventId,
          task_name: template.name,
          start_date: taskDate.toISOString(),
          end_date: taskDate.toISOString(),
          order_by_date: template.is_order_by ? taskDate.toISOString().split('T')[0] : null,
          status: 'pending',
          priority: template.priority,
          milestone: template.priority === 'critical',
          sort_order: index
        };
      });

      const { data, error } = await supabase
        .from('timeline_tasks')
        .insert(tasksToCreate)
        .select();

      if (error) throw error;

      if (data) {
        setTasks(data);
        const orderTask = data.find(t => t.order_by_date);
        if (orderTask) {
          setOrderByDate(orderTask.order_by_date);
        }
      }

      toast({
        title: 'Success',
        description: 'Default timeline created'
      });
    } catch (error) {
      console.error('Error creating default tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to create default timeline',
        variant: 'destructive'
      });
    }
  };

  const saveTask = async () => {
    if (!newTask.task_name) return;

    try {
      const taskData = {
        ...newTask,
        event_id: eventId,
        sort_order: tasks.length
      };

      if (editingTask?.id) {
        // Update existing task
        const { error } = await supabase
          .from('timeline_tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        // Create new task
        const { error } = await supabase
          .from('timeline_tasks')
          .insert(taskData);

        if (error) throw error;
      }

      await fetchTimelineData();
      setIsAddingTask(false);
      setEditingTask(null);
      setNewTask({
        task_name: '',
        status: 'pending',
        priority: 'medium',
        milestone: false,
        sort_order: 0
      });

      toast({
        title: 'Success',
        description: editingTask ? 'Task updated' : 'Task added'
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task',
        variant: 'destructive'
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: TimelineTask['status']) => {
    try {
      const { error } = await supabase
        .from('timeline_tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      await fetchTimelineData();
      
      toast({
        title: 'Success',
        description: 'Task status updated'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const updateOrderByDate = async (date: string) => {
    try {
      // Clear any existing order_by_date
      await supabase
        .from('timeline_tasks')
        .update({ order_by_date: null })
        .eq('event_id', eventId)
        .not('order_by_date', 'is', null);

      // Set the new order_by_date on the "Order Flowers" task or create one
      const orderTask = tasks.find(t => t.task_name.toLowerCase().includes('order'));
      
      if (orderTask?.id) {
        const { error } = await supabase
          .from('timeline_tasks')
          .update({ order_by_date: date })
          .eq('id', orderTask.id);

        if (error) throw error;
      } else {
        // Create a new order task
        const { error } = await supabase
          .from('timeline_tasks')
          .insert({
            event_id: eventId,
            task_name: 'Order Flowers',
            order_by_date: date,
            status: 'pending',
            priority: 'critical',
            milestone: true,
            sort_order: 2
          });

        if (error) throw error;
      }

      setOrderByDate(date);
      await fetchTimelineData();
      
      toast({
        title: 'Success',
        description: 'Order by date updated'
      });
    } catch (error) {
      console.error('Error updating order by date:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order by date',
        variant: 'destructive'
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await fetchTimelineData();
      
      toast({
        title: 'Success',
        description: 'Task removed'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove task',
        variant: 'destructive'
      });
    }
  };

  const getTaskProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getDaysUntilEvent = () => {
    if (!eventDate) return null;
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilOrder = () => {
    if (!orderByDate) return null;
    const today = new Date();
    const order = new Date(orderByDate);
    const diffTime = order.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      {/* Critical Order By Date Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <ShoppingCart className="w-5 h-5" />
            Order By Date (Critical)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-900">
                {orderByDate ? new Date(orderByDate).toLocaleDateString() : 'Not Set'}
              </p>
              {getDaysUntilOrder() !== null && (
                <p className="text-sm text-orange-700">
                  {getDaysUntilOrder() > 0 
                    ? `${getDaysUntilOrder()} days until order deadline`
                    : getDaysUntilOrder() === 0
                    ? 'Order deadline is TODAY!'
                    : `${Math.abs(getDaysUntilOrder())} days overdue`
                  }
                </p>
              )}
            </div>
            <div>
              <Label>Update Order By Date</Label>
              <Input
                type="date"
                value={orderByDate || ''}
                onChange={(e) => updateOrderByDate(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Until Event</p>
                <p className="text-2xl font-bold">
                  {getDaysUntilEvent() !== null ? getDaysUntilEvent() : '--'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Task Progress</p>
                <p className="text-2xl font-bold">{getTaskProgress()}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'pending').length}
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
                <p className="text-sm text-muted-foreground">Blocked Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'blocked').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List/Gantt View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timeline Tasks</span>
            <div className="flex gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'gantt')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="gantt">Gantt View</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsAddingTask(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className={task.order_by_date ? 'bg-orange-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {task.milestone && <Flag className="w-4 h-4 text-purple-600" />}
                        {task.order_by_date && <ShoppingCart className="w-4 h-4 text-orange-600" />}
                        {task.task_name}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.start_date ? new Date(task.start_date).toLocaleDateString() : '--'}
                    </TableCell>
                    <TableCell>
                      {task.end_date ? new Date(task.end_date).toLocaleDateString() : '--'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onValueChange={(value) => task.id && updateTaskStatus(task.id, value as TimelineTask['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color
                      }>
                        {PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.milestone && <Badge variant="secondary">Milestone</Badge>}
                      {task.order_by_date && <Badge className="bg-orange-100 text-orange-800">Order By</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTask(task);
                            setNewTask(task);
                            setIsAddingTask(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => task.id && deleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-muted-foreground">Gantt chart view coming soon</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Name</Label>
              <Input
                value={newTask.task_name}
                onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                placeholder="e.g., Order flowers, Confirm venue details"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Additional details about this task..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newTask.start_date?.split('T')[0] || ''}
                  onChange={(e) => setNewTask({ 
                    ...newTask, 
                    start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newTask.end_date?.split('T')[0] || ''}
                  onChange={(e) => setNewTask({ 
                    ...newTask, 
                    end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ 
                    ...newTask, 
                    status: value as TimelineTask['status'] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ 
                    ...newTask, 
                    priority: value as TimelineTask['priority'] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="milestone"
                checked={newTask.milestone}
                onCheckedChange={(checked) => setNewTask({ 
                  ...newTask, 
                  milestone: checked as boolean 
                })}
              />
              <Label htmlFor="milestone">Mark as milestone</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsAddingTask(false);
                setEditingTask(null);
                setNewTask({
                  task_name: '',
                  status: 'pending',
                  priority: 'medium',
                  milestone: false,
                  sort_order: 0
                });
              }}>
                Cancel
              </Button>
              <Button onClick={saveTask}>
                <Save className="w-4 h-4 mr-2" />
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventTimeline;