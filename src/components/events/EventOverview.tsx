// src/components/events/EventOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  FileText, 
  Palette, 
  Flower, 
  Plus, 
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventOverviewProps {
  eventId: string;
}

interface Consultation {
  id: string;
  consultation_date: string;
  audio_url?: string;
  transcript?: string;
  notes?: string;
  duration_minutes?: number;
  key_points?: {
    colors?: string[];
    flowers?: string[];
    themes?: string[];
    special_requests?: string[];
  };
}

interface EventDesign {
  id?: string;
  color_scheme?: string[];
  style?: string;
  key_flowers?: string[];
  special_requirements?: string;
}

interface EventData {
  event_date?: string;
  status: string;
  updated_at: string;
}

const STYLE_OPTIONS = [
  'modern', 'classic', 'rustic', 'romantic', 
  'bohemian', 'minimalist', 'garden', 'vintage', 'other'
];

const COMMON_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B731',
  '#5F27CD', '#00D2D3', '#FF9FF3', '#54A0FF',
  '#48DBFB', '#FECA57', '#FF6348', '#30336B'
];

const EventOverview = ({ eventId }: EventOverviewProps) => {
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [eventDesign, setEventDesign] = useState<EventDesign>({});
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isEditingDesign, setIsEditingDesign] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [tempDesign, setTempDesign] = useState<EventDesign>({});
  const [commonFlowers, setCommonFlowers] = useState<string[]>([
    'Roses', 'Peonies', 'Hydrangeas', 'Eucalyptus', 
    'Ranunculus', 'Dahlias', 'Tulips', 'Orchids',
    'Lilies', 'Carnations', 'Baby\'s Breath', 'Greenery'
  ]);
  const [customFlower, setCustomFlower] = useState('');

  // Event status timeline data
  const [statusTimeline, setStatusTimeline] = useState([
    { status: 'consultation', label: 'Consultation', date: '', completed: false, current: false },
    { status: 'planning', label: 'Planning', date: '', completed: false, current: false },
    { status: 'approved', label: 'Approved', date: '', completed: false, current: false },
    { status: 'completed', label: 'Completed', date: '', completed: false, current: false }
  ]);
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    fetchOverviewData();
  }, [eventId]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      // Fetch consultation data
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .eq('event_id', eventId)
        .order('consultation_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (consultError && consultError.code !== 'PGRST116') {
        throw consultError;
      }

      if (consultData) {
        setConsultation(consultData);
        setNotes(consultData.notes || '');
        setDurationMinutes(consultData.duration_minutes || '');
      }

      // Fetch event design data
      const { data: designData, error: designError } = await supabase
        .from('event_design')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (designError && designError.code !== 'PGRST116') {
        throw designError;
      }

      if (designData) {
        setEventDesign(designData);
        setTempDesign(designData);
      }

      // Fetch event status and date for timeline
      const { data: eventInfo, error: eventError } = await supabase
        .from('events')
        .select('status, event_date, created_at, updated_at')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      setEventData(eventInfo);

      // FIXED: Update status timeline based on current status
      const updatedTimeline = statusTimeline.map(item => ({
        ...item,
        completed: false,
        current: false,
        date: ''
      }));

      const statusMap: Record<string, number> = {
        'consultation': 0,
        'planning': 1,
        'approved': 2,
        'completed': 3
      };

      const currentIndex = statusMap[eventInfo.status.toLowerCase()] || 0;
      
      // Mark all statuses up to current as completed
      for (let i = 0; i <= currentIndex; i++) {
        updatedTimeline[i].completed = true;
      }
      
      // Mark ONLY the current status as current
      updatedTimeline[currentIndex].current = true;
      updatedTimeline[currentIndex].date = new Date(eventInfo.updated_at).toLocaleDateString();
      
      setStatusTimeline(updatedTimeline);

    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load overview data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      setEditingStatus(false);
      await fetchOverviewData(); // Refresh to update timeline
      
      toast({
        title: 'Success',
        description: 'Event status updated successfully'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive'
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      // First, get the organization_id from the event
      const { data: eventDataOrg, error: eventError } = await supabase
        .from('events')
        .select('organization_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (consultation) {
        // Update existing consultation
        const { error } = await supabase
          .from('consultations')
          .update({ 
            notes,
            duration_minutes: durationMinutes || null
          })
          .eq('id', consultation.id);

        if (error) throw error;
        
        // Update local state
        setConsultation({
          ...consultation,
          notes,
          duration_minutes: durationMinutes ? Number(durationMinutes) : undefined
        });
      } else {
        // Create new consultation - audio_url can be null if schema is fixed
        const { data, error } = await supabase
          .from('consultations')
          .insert({
            event_id: eventId,
            organization_id: eventDataOrg.organization_id,
            notes,
            duration_minutes: durationMinutes || null,
            audio_url: null,
            consultation_date: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        setConsultation(data);
      }

      setIsEditingNotes(false);
      toast({
        title: 'Success',
        description: 'Notes saved successfully'
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive'
      });
    }
  };

  const handleSaveDesign = async () => {
    try {
      if (eventDesign.id) {
        // Update existing design
        const { error } = await supabase
          .from('event_design')
          .update(tempDesign)
          .eq('id', eventDesign.id);

        if (error) throw error;
        setEventDesign(tempDesign);
      } else {
        // Create new design
        const { data, error } = await supabase
          .from('event_design')
          .insert({
            ...tempDesign,
            event_id: eventId
          })
          .select()
          .single();

        if (error) throw error;
        setEventDesign(data);
        setTempDesign(data);
      }

      setIsEditingDesign(false);
      toast({
        title: 'Success',
        description: 'Design details saved successfully'
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save design details',
        variant: 'destructive'
      });
    }
  };

  const addColor = (color: string) => {
    const currentColors = tempDesign.color_scheme || [];
    if (!currentColors.includes(color)) {
      setTempDesign({
        ...tempDesign,
        color_scheme: [...currentColors, color]
      });
    }
  };

  const removeColor = (color: string) => {
    const currentColors = tempDesign.color_scheme || [];
    setTempDesign({
      ...tempDesign,
      color_scheme: currentColors.filter(c => c !== color)
    });
  };

  const addFlower = (flower: string) => {
    if (!flower) return;
    const currentFlowers = tempDesign.key_flowers || [];
    if (!currentFlowers.includes(flower)) {
      setTempDesign({
        ...tempDesign,
        key_flowers: [...currentFlowers, flower]
      });
    }
  };

  const addCustomFlower = () => {
    if (!customFlower.trim()) return;
    
    // Add to temp design
    addFlower(customFlower.trim());
    
    // Add to common flowers if not already there
    if (!commonFlowers.includes(customFlower.trim())) {
      setCommonFlowers([...commonFlowers, customFlower.trim()].sort());
    }
    
    setCustomFlower('');
  };

  const removeFlower = (flower: string) => {
    const currentFlowers = tempDesign.key_flowers || [];
    setTempDesign({
      ...tempDesign,
      key_flowers: currentFlowers.filter(f => f !== flower)
    });
  };

  const calculateDaysUntilEvent = () => {
    if (!eventData?.event_date) return '--';
    
    // event_date is stored as timestamptz in Postgres
    // Extract just the date part and use UTC to avoid timezone issues
    const eventDate = new Date(eventData.event_date);
    const eventDateOnly = new Date(Date.UTC(
      eventDate.getUTCFullYear(),
      eventDate.getUTCMonth(),
      eventDate.getUTCDate()
    ));
    
    const today = new Date();
    const todayOnly = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    ));
    
    const diffTime = eventDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : 0;
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
      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Event Timeline
            </span>
            {!editingStatus && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingStatus(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Status
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-0 top-5 bottom-5 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {statusTimeline.map((item, index) => (
                <div key={index} className="relative flex items-center">
                  <div className={`
                    absolute left-0 w-4 h-4 rounded-full border-2 -translate-x-1/2
                    ${item.completed 
                      ? item.current 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'}
                  `}>
                    {item.completed && !item.current && (
                      <CheckCircle className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
                    )}
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${item.current ? 'text-blue-600' : ''}`}>
                          {item.label}
                        </p>
                        {item.date && (
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.current && !editingStatus && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                        {editingStatus && (
                          <Button
                            size="sm"
                            variant={item.current ? "secondary" : "outline"}
                            onClick={() => handleStatusUpdate(item.status)}
                          >
                            {item.current ? 'Current' : 'Set as Current'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {editingStatus && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStatus(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consultation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Consultation Notes
            </span>
            {!isEditingNotes && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingNotes(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g., 60"
                  min="0"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add consultation notes, key discussion points, client preferences..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNotes(consultation?.notes || '');
                    setDurationMinutes(consultation?.duration_minutes || '');
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {durationMinutes && (
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{durationMinutes} minutes</p>
                </div>
              )}
              <div className="prose max-w-none">
                {notes || <p className="text-muted-foreground">No consultation notes yet</p>}
              </div>
            </div>
          )}

          {consultation?.transcript && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Transcript</h4>
              <p className="text-sm text-gray-700">{consultation.transcript}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Design Elements
            </span>
            {!isEditingDesign && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTempDesign(eventDesign);
                  setIsEditingDesign(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingDesign ? (
            <>
              {/* Style Selection */}
              <div>
                <Label>Style</Label>
                <Select
                  value={tempDesign.style || ''}
                  onValueChange={(value) => setTempDesign({ ...tempDesign, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map(style => (
                      <SelectItem key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Scheme */}
              <div>
                <Label>Color Scheme</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tempDesign.color_scheme?.map(color => (
                    <div
                      key={color}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border"
                      style={{ backgroundColor: color + '20', borderColor: color }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{color}</span>
                      <button
                        onClick={() => removeColor(color)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  {COMMON_COLORS.map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => addColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Key Flowers */}
              <div>
                <Label>Key Flowers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tempDesign.key_flowers?.map(flower => (
                    <Badge key={flower} variant="secondary">
                      {flower}
                      <button
                        onClick={() => removeFlower(flower)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  <Select onValueChange={addFlower}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add flower type" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonFlowers.map(flower => (
                        <SelectItem key={flower} value={flower}>
                          {flower}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      value={customFlower}
                      onChange={(e) => setCustomFlower(e.target.value)}
                      placeholder="Or type custom flower name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomFlower();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addCustomFlower}
                      disabled={!customFlower.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <Label>Special Requirements</Label>
                <Textarea
                  value={tempDesign.special_requirements || ''}
                  onChange={(e) => setTempDesign({ 
                    ...tempDesign, 
                    special_requirements: e.target.value 
                  })}
                  placeholder="Any specific design requirements or restrictions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveDesign}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Design
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempDesign(eventDesign);
                    setIsEditingDesign(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Style</p>
                <p className="font-medium capitalize">
                  {eventDesign.style || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Color Scheme</p>
                <div className="flex flex-wrap gap-2">
                  {eventDesign.color_scheme?.length ? (
                    eventDesign.color_scheme.map(color => (
                      <div
                        key={color}
                        className="flex items-center gap-1 px-2 py-1 rounded-full border"
                        style={{ backgroundColor: color + '20', borderColor: color }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No colors selected</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Key Flowers</p>
                <div className="flex flex-wrap gap-2">
                  {eventDesign.key_flowers?.length ? (
                    eventDesign.key_flowers.map(flower => (
                      <Badge key={flower} variant="secondary">
                        <Flower className="w-3 h-3 mr-1" />
                        {flower}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No flowers specified</p>
                  )}
                </div>
              </div>

              {eventDesign.special_requirements && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Requirements</p>
                  <p>{eventDesign.special_requirements}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Until Event</p>
                <p className="text-2xl font-bold">
                  {calculateDaysUntilEvent()}
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
                <p className="text-sm text-muted-foreground">Consultation Duration</p>
                <p className="text-2xl font-bold">
                  {durationMinutes ? `${durationMinutes} min` : '--'}
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
                <p className="text-sm text-muted-foreground">Progress Status</p>
                <p className="text-2xl font-bold">
                  {statusTimeline.filter(s => s.completed).length} / {statusTimeline.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventOverview;