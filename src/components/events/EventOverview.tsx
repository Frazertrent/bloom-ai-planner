// src/components/events/EventOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  MessageSquare,
  Palette,
  Flower,
  Plus,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventPhase, PHASE_CONFIGS } from '@/types/phase1';

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
  current_phase: EventPhase;
  order_deadline_date?: string;
  processing_date?: string;
  production_date?: string;
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
  const { toast } = useToast();
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
        setConsultation(consultData as unknown as Consultation);
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
        const design = designData as unknown as EventDesign;
        setEventDesign(design);
        setTempDesign(design);
      }

      // Fetch event data including phase
      const { data: eventInfo, error: eventError } = await supabase
        .from('events')
        .select('status, event_date, created_at, updated_at, current_phase, order_deadline_date, processing_date, production_date')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      setEventData(eventInfo as unknown as EventData);

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

  const handleSaveNotes = async () => {
    try {
      const { data: eventDataOrg, error: eventError } = await supabase
        .from('events')
        .select('organization_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (consultation) {
        const { error } = await supabase
          .from('consultations')
          .update({ 
            notes,
            duration_minutes: durationMinutes || null
          })
          .eq('id', consultation.id);

        if (error) throw error;
        
        setConsultation({
          ...consultation,
          notes,
          duration_minutes: durationMinutes ? Number(durationMinutes) : undefined
        });
      } else {
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
        setConsultation(data as unknown as Consultation);
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
        const { error } = await supabase
          .from('event_design')
          .update(tempDesign)
          .eq('id', eventDesign.id);

        if (error) throw error;
        setEventDesign(tempDesign);
      } else {
        const { data, error } = await supabase
          .from('event_design')
          .insert({
            ...tempDesign,
            event_id: eventId
          })
          .select()
          .single();

        if (error) throw error;
        const design = data as unknown as EventDesign;
        setEventDesign(design);
        setTempDesign(design);
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
    
    addFlower(customFlower.trim());
    
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
    if (!eventData?.event_date) return null;
    
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

  const calculateDaysUntilDeadline = (deadlineDate?: string) => {
    if (!deadlineDate) return null;
    
    const deadline = new Date(deadlineDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getPhaseAlerts = () => {
    if (!eventData?.current_phase) return [];
    
    const phase = eventData.current_phase;
    const alerts = [];
    const daysUntilEvent = calculateDaysUntilEvent();

    // Phase-specific critical alerts
    switch (phase) {
      case 'lead':
        if (!consultation) {
          alerts.push({
            type: 'warning' as const,
            icon: MessageSquare,
            title: 'Schedule Consultation',
            description: 'Book initial consultation with client to gather requirements',
            action: 'Add Consultation'
          });
        }
        break;

      case 'consultation':
        if (!consultation?.notes) {
          alerts.push({
            type: 'warning' as const,
            icon: MessageSquare,
            title: 'Complete Consultation Notes',
            description: 'Document client preferences and requirements',
            action: 'Add Notes'
          });
        }
        if (!eventDesign.style) {
          alerts.push({
            type: 'info' as const,
            icon: Palette,
            title: 'Start Design Planning',
            description: 'Begin defining color scheme and style preferences',
            action: 'Add Design'
          });
        }
        break;

      case 'design':
        if (!eventDesign.color_scheme || eventDesign.color_scheme.length === 0) {
          alerts.push({
            type: 'warning' as const,
            icon: Palette,
            title: 'Finalize Color Scheme',
            description: 'Select and confirm color palette with client',
            action: 'Edit Design'
          });
        }
        if (!eventData.order_deadline_date) {
          alerts.push({
            type: 'error' as const,
            icon: ShoppingCart,
            title: 'Set Order Deadline',
            description: 'Critical: Set flower order deadline date',
            action: 'Set Deadline'
          });
        }
        break;

      case 'ordering':
        if (eventData.order_deadline_date) {
          const daysUntilOrder = calculateDaysUntilDeadline(eventData.order_deadline_date);
          if (daysUntilOrder !== null && daysUntilOrder <= 3) {
            alerts.push({
              type: 'error' as const,
              icon: AlertTriangle,
              title: 'Order Deadline Approaching!',
              description: `Only ${daysUntilOrder} day${daysUntilOrder !== 1 ? 's' : ''} until order deadline`,
              action: 'Place Orders'
            });
          }
        }
        break;

      case 'processing':
        alerts.push({
          type: 'info' as const,
          icon: Package,
          title: 'Processing Phase Active',
          description: 'Track flower receipt and processing progress',
          action: 'View Production'
        });
        if (daysUntilEvent !== null && daysUntilEvent <= 2) {
          alerts.push({
            type: 'warning' as const,
            icon: Clock,
            title: 'Production Starts Soon',
            description: 'Event in 2 days - ensure all flowers are processed',
            action: 'Check Status'
          });
        }
        break;

      case 'production':
        alerts.push({
          type: 'warning' as const,
          icon: Flower,
          title: 'Production Day',
          description: 'Creating arrangements - monitor progress',
          action: 'View Production'
        });
        break;

      case 'delivery':
        alerts.push({
          type: 'error' as const,
          icon: Truck,
          title: 'Delivery Day!',
          description: 'Event is today - coordinate setup and delivery',
          action: 'View Delivery'
        });
        break;

      case 'closeout':
        alerts.push({
          type: 'info' as const,
          icon: DollarSign,
          title: 'Reconcile Event',
          description: 'Complete financial reconciliation and close out',
          action: 'View Financials'
        });
        break;
    }

    return alerts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const phaseConfig = eventData?.current_phase ? PHASE_CONFIGS[eventData.current_phase] : null;
  const phaseAlerts = getPhaseAlerts();

  return (
    <div className="space-y-6">
      {/* Current Phase Card */}
      {phaseConfig && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Current Phase: {phaseConfig.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {phaseConfig.description}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {calculateDaysUntilEvent() !== null 
                  ? `${calculateDaysUntilEvent()} days until event`
                  : 'Event date not set'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {phaseAlerts.length > 0 && (
        <div className="space-y-3">
          {phaseAlerts.map((alert, index) => (
            <Alert 
              key={index}
              variant={alert.type === 'error' ? 'destructive' : 'default'}
              className={
                alert.type === 'error' 
                  ? 'border-red-300 bg-red-50' 
                  : alert.type === 'warning'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-blue-300 bg-blue-50'
              }
            >
              <alert.icon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.description}</span>
                <Button size="sm" variant="outline">
                  {alert.action}
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

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
                  {calculateDaysUntilEvent() ?? '--'}
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
                <p className="text-sm text-muted-foreground">Current Phase</p>
                <p className="text-2xl font-bold capitalize">
                  {phaseConfig?.label || '--'}
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