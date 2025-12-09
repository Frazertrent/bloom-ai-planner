// src/components/events/EventConsultation.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Alert component removed - not needed
import { 
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Mic,
  FileText,
  Users,
  DollarSign,
  MapPin,
  Flower,
  Info,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventConsultationProps {
  eventId: string;
}

interface ConsultationData {
  id?: string;
  event_id: string;
  organization_id?: string;
  consultation_date?: string;
  duration_minutes?: number;
  
  // Pre-consultation prep - now JSONB with completion status
  prep_checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  
  // Basic info
  notes?: string;
  style_keywords?: string[];
  color_palette?: {
    primary?: string[];
    accent?: string[];
    avoid?: string[];
  };
  
  // Flowers
  must_have_flowers?: string[];
  flowers_to_avoid?: string[];
  
  // Budget
  budget_target?: number;
  budget_min?: number;
  budget_max?: number;
  budget_flexibility?: string;
  budget_priorities?: string;
  
  // Logistics
  ceremony_location?: string;
  ceremony_setup_time?: string;
  ceremony_breakdown_time?: string;
  reception_location?: string;
  reception_setup_time?: string;
  reception_breakdown_time?: string;
  venue_restrictions?: string;
  
  // Details
  guest_count?: number;
  table_count?: number;
  bridal_party_size?: {
    bridesmaids?: number;
    groomsmen?: number;
    flower_girls?: number;
    ring_bearers?: number;
  };
  pieces_needed?: {
    bridal_bouquet?: boolean;
    bridesmaid_bouquets?: boolean;
    boutonnieres?: boolean;
    corsages?: boolean;
    ceremony_arrangements?: boolean;
    reception_centerpieces?: boolean;
    cake_flowers?: boolean;
    other?: string[];
  };
  
  // Special considerations
  religious_cultural_notes?: string;
  sustainability_preferences?: string;
  accessibility_needs?: string;
  allergy_concerns?: string;
  
  // Source
  referral_source?: string;
  
  // Recording
  audio_url?: string;
  transcript?: string;
  
  // Follow-up
  follow_up_items?: string[];
  next_meeting_date?: string;
}

interface Flower {
  id: string;
  name: string;
  variety?: string;
}

const DEFAULT_PREP_CHECKLIST = [
  { item: 'Review event type and date', completed: false },
  { item: 'Research venue(s)', completed: false },
  { item: 'Prepare portfolio samples', completed: false },
  { item: 'Create budget worksheet', completed: false },
  { item: 'Prepare style questionnaire', completed: false },
  { item: 'Check seasonal flower availability', completed: false },
  { item: 'Review contract templates', completed: false },
  { item: 'Prepare venue restriction questions', completed: false }
];

const STYLE_KEYWORDS = [
  'romantic', 'modern', 'rustic', 'classic', 'bohemian',
  'garden', 'vintage', 'minimalist', 'elegant', 'whimsical',
  'tropical', 'seasonal', 'luxurious', 'natural', 'dramatic'
];

const BUDGET_FLEXIBILITY_OPTIONS = [
  { value: 'hard', label: 'Fixed - Cannot exceed budget' },
  { value: 'flexible', label: 'Somewhat Flexible - Minor adjustments OK' },
  { value: 'very_flexible', label: 'Very Flexible - Quality prioritized over cost' }
];

const COMMON_PIECES = [
  { key: 'bridal_bouquet', label: 'Bridal Bouquet' },
  { key: 'bridesmaid_bouquets', label: 'Bridesmaid Bouquets' },
  { key: 'boutonnieres', label: 'Boutonnieres' },
  { key: 'corsages', label: 'Corsages' },
  { key: 'ceremony_arrangements', label: 'Ceremony Arrangements' },
  { key: 'reception_centerpieces', label: 'Reception Centerpieces' },
  { key: 'cake_flowers', label: 'Cake Flowers' }
];

const EventConsultation = ({ eventId }: EventConsultationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationData>({
    event_id: eventId,
    prep_checklist: [],
    color_palette: { primary: [], accent: [], avoid: [] },
    bridal_party_size: {},
    pieces_needed: {}
  });
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [activeTab, setActiveTab] = useState('prep');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    fetchConsultationData();
    fetchFlowers();
  }, [eventId]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [consultation, hasUnsavedChanges]);

  const fetchConsultationData = async () => {
    try {
      setLoading(true);
      
      // Fetch event data first to pre-populate
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('guest_count, budget_target, venues, special_instructions')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Fetch existing consultation data
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (consultError && consultError.code !== 'PGRST116') {
        throw consultError;
      }

      if (consultData) {
        // Use existing consultation data
        setConsultation({
          ...consultData,
          prep_checklist: (consultData.prep_checklist as unknown as ConsultationData['prep_checklist']) || DEFAULT_PREP_CHECKLIST,
          color_palette: (consultData.color_palette as unknown as ConsultationData['color_palette']) || { primary: [], accent: [], avoid: [] },
          bridal_party_size: (consultData.bridal_party_size as unknown as ConsultationData['bridal_party_size']) || {},
          pieces_needed: (consultData.pieces_needed as unknown as ConsultationData['pieces_needed']) || {},
          // Convert timestamps to datetime-local format
          consultation_date: consultData.consultation_date 
            ? new Date(consultData.consultation_date).toISOString().slice(0, 16)
            : undefined,
          next_meeting_date: consultData.next_meeting_date
            ? new Date(consultData.next_meeting_date).toISOString().slice(0, 16)
            : undefined
        } as ConsultationData);
      } else {
        // Pre-populate from event data for new consultation
        const venues = eventData.venues || [];
        const firstVenue = venues[0];
        
        const newConsultation: ConsultationData = {
          event_id: eventId,
          prep_checklist: DEFAULT_PREP_CHECKLIST,
          color_palette: { primary: [], accent: [], avoid: [] },
          bridal_party_size: {},
          pieces_needed: {},
          // Pre-populate from event
          guest_count: eventData.guest_count || undefined,
          budget_target: eventData.budget_target || undefined,
          budget_min: eventData.budget_target || undefined,
          budget_max: eventData.budget_target ? eventData.budget_target * 1.2 : undefined,
          ceremony_location: firstVenue?.name ? `${firstVenue.name}${firstVenue.address ? ', ' + firstVenue.address : ''}` : undefined,
          reception_location: firstVenue?.name ? `${firstVenue.name}${firstVenue.address ? ', ' + firstVenue.address : ''}` : undefined,
          notes: eventData.special_instructions || undefined
        };
        
        setConsultation(newConsultation);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consultation data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFlowers = async () => {
    try {
      const { data, error } = await supabase
        .from('flower_catalog')
        .select('id, name, variety')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFlowers(data || []);
    } catch (error) {
      console.error('Error fetching flowers:', error);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    try {
      setSaving(true);

      // Get organization_id from event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('organization_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const dataToSave = {
        ...consultation,
        organization_id: eventData.organization_id,
        event_id: eventId
      };

      if (consultation.id) {
        // Update existing
        const { error } = await supabase
          .from('consultations')
          .update(dataToSave)
          .eq('id', consultation.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('consultations')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setConsultation({ ...consultation, id: data.id });
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast({
          title: 'Success',
          description: 'Consultation saved successfully'
        });
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save consultation',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConsultation = (updates: Partial<ConsultationData>) => {
    setConsultation({ ...consultation, ...updates });
    setHasUnsavedChanges(true);
  };

  const togglePrepItem = (itemText: string) => {
    const checklist = consultation.prep_checklist || [];
    const updated = checklist.map(item => 
      item.item === itemText 
        ? { ...item, completed: !item.completed }
        : item
    );
    updateConsultation({ prep_checklist: updated });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const checklist = consultation.prep_checklist || [];
    updateConsultation({ 
      prep_checklist: [...checklist, { item: newChecklistItem.trim(), completed: false }] 
    });
    setNewChecklistItem('');
  };

  const removeChecklistItem = (itemText: string) => {
    const checklist = consultation.prep_checklist || [];
    updateConsultation({ prep_checklist: checklist.filter(i => i.item !== itemText) });
  };

  const toggleStyleKeyword = (keyword: string) => {
    const keywords = consultation.style_keywords || [];
    const updated = keywords.includes(keyword)
      ? keywords.filter(k => k !== keyword)
      : [...keywords, keyword];
    updateConsultation({ style_keywords: updated });
  };

  const addColorToPalette = (category: 'primary' | 'accent' | 'avoid', color: string) => {
    const palette = consultation.color_palette || { primary: [], accent: [], avoid: [] };
    const categoryColors = palette[category] || [];
    if (!categoryColors.includes(color)) {
      updateConsultation({
        color_palette: {
          ...palette,
          [category]: [...categoryColors, color]
        }
      });
    }
  };

  const removeColorFromPalette = (category: 'primary' | 'accent' | 'avoid', color: string) => {
    const palette = consultation.color_palette || { primary: [], accent: [], avoid: [] };
    updateConsultation({
      color_palette: {
        ...palette,
        [category]: (palette[category] || []).filter(c => c !== color)
      }
    });
  };

  const toggleFlower = (flowerId: string, type: 'must_have' | 'avoid') => {
    const field = type === 'must_have' ? 'must_have_flowers' : 'flowers_to_avoid';
    const current = consultation[field] || [];
    const updated = current.includes(flowerId)
      ? current.filter(id => id !== flowerId)
      : [...current, flowerId];
    updateConsultation({ [field]: updated });
  };

  const togglePieceNeeded = (piece: string) => {
    const pieces = consultation.pieces_needed || {};
    updateConsultation({
      pieces_needed: {
        ...pieces,
        [piece]: !pieces[piece as keyof typeof pieces]
      }
    });
  };

  const getCompletionPercentage = () => {
    const fields = [
      consultation.consultation_date,
      consultation.notes,
      consultation.style_keywords?.length,
      consultation.color_palette?.primary?.length,
      consultation.budget_target,
      consultation.ceremony_location,
      consultation.guest_count,
      Object.keys(consultation.pieces_needed || {}).length
    ];
    
    const completed = fields.filter(f => f).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header with Save Status */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-semibold">Consultation Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completionPercentage}% complete
                {lastSaved && (
                  <span className="ml-2">
                    • Last saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
          </div>
          <Button onClick={() => handleSave(false)} disabled={saving || !hasUnsavedChanges}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
        </TabsList>

        {/* Prep Tab */}
        <TabsContent value="prep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Pre-Consultation Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {consultation.prep_checklist?.map((checklistItem) => (
                  <div key={checklistItem.item} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <Checkbox
                        id={checklistItem.item}
                        checked={checklistItem.completed}
                        onCheckedChange={() => togglePrepItem(checklistItem.item)}
                      />
                      <label
                        htmlFor={checklistItem.item}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          checklistItem.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {checklistItem.item}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(checklistItem.item)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add custom checklist item..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                />
                <Button
                  onClick={addChecklistItem}
                  disabled={!newChecklistItem.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Consultation Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={consultation.consultation_date || ''}
                  onChange={(e) => updateConsultation({ consultation_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Expected Duration (minutes)</Label>
                <Input
                  type="number"
                  value={consultation.duration_minutes || ''}
                  onChange={(e) => updateConsultation({ 
                    duration_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="e.g., 60"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Target Budget</Label>
                <Input
                  type="number"
                  value={consultation.budget_target || ''}
                  onChange={(e) => updateConsultation({ 
                    budget_target: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="$0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Budget</Label>
                  <Input
                    type="number"
                    value={consultation.budget_min || ''}
                    onChange={(e) => updateConsultation({ 
                      budget_min: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Maximum Budget</Label>
                  <Input
                    type="number"
                    value={consultation.budget_max || ''}
                    onChange={(e) => updateConsultation({ 
                      budget_max: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="$0"
                  />
                </div>
              </div>
              <div>
                <Label>Budget Flexibility</Label>
                <Select
                  value={consultation.budget_flexibility || ''}
                  onValueChange={(value) => updateConsultation({ budget_flexibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flexibility level" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_FLEXIBILITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget Priorities</Label>
                <Textarea
                  value={consultation.budget_priorities || ''}
                  onChange={(e) => updateConsultation({ budget_priorities: e.target.value })}
                  placeholder="What's most important to spend on? What can be scaled back?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Guest Count</Label>
                  <Input
                    type="number"
                    value={consultation.guest_count || ''}
                    onChange={(e) => updateConsultation({ 
                      guest_count: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Table Count</Label>
                  <Input
                    type="number"
                    value={consultation.table_count || ''}
                    onChange={(e) => updateConsultation({ 
                      table_count: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Bridal Party Size</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Bridesmaids</Label>
                    <Input
                      type="number"
                      value={consultation.bridal_party_size?.bridesmaids || ''}
                      onChange={(e) => updateConsultation({
                        bridal_party_size: {
                          ...consultation.bridal_party_size,
                          bridesmaids: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Groomsmen</Label>
                    <Input
                      type="number"
                      value={consultation.bridal_party_size?.groomsmen || ''}
                      onChange={(e) => updateConsultation({
                        bridal_party_size: {
                          ...consultation.bridal_party_size,
                          groomsmen: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Flower Girls</Label>
                    <Input
                      type="number"
                      value={consultation.bridal_party_size?.flower_girls || ''}
                      onChange={(e) => updateConsultation({
                        bridal_party_size: {
                          ...consultation.bridal_party_size,
                          flower_girls: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Ring Bearers</Label>
                    <Input
                      type="number"
                      value={consultation.bridal_party_size?.ring_bearers || ''}
                      onChange={(e) => updateConsultation({
                        bridal_party_size: {
                          ...consultation.bridal_party_size,
                          ring_bearers: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Pieces Needed</Label>
                <div className="grid grid-cols-2 gap-3">
                  {COMMON_PIECES.map(piece => (
                    <div key={piece.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={piece.key}
                        checked={!!consultation.pieces_needed?.[piece.key as keyof typeof consultation.pieces_needed]}
                        onCheckedChange={() => togglePieceNeeded(piece.key)}
                      />
                      <label htmlFor={piece.key} className="text-sm">
                        {piece.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Special Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Religious/Cultural Notes</Label>
                <Textarea
                  value={consultation.religious_cultural_notes || ''}
                  onChange={(e) => updateConsultation({ religious_cultural_notes: e.target.value })}
                  placeholder="Any religious or cultural traditions to consider?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Sustainability Preferences</Label>
                <Textarea
                  value={consultation.sustainability_preferences || ''}
                  onChange={(e) => updateConsultation({ sustainability_preferences: e.target.value })}
                  placeholder="Locally sourced? Organic? Seasonal only?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Accessibility Needs</Label>
                <Textarea
                  value={consultation.accessibility_needs || ''}
                  onChange={(e) => updateConsultation({ accessibility_needs: e.target.value })}
                  placeholder="Any accessibility considerations?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Allergy Concerns</Label>
                <Textarea
                  value={consultation.allergy_concerns || ''}
                  onChange={(e) => updateConsultation({ allergy_concerns: e.target.value })}
                  placeholder="Any flower or plant allergies to avoid?"
                  rows={2}
                />
              </div>
              <div>
                <Label>Referral Source</Label>
                <Input
                  value={consultation.referral_source || ''}
                  onChange={(e) => updateConsultation({ referral_source: e.target.value })}
                  placeholder="How did they hear about us?"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Style Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {STYLE_KEYWORDS.map(keyword => (
                  <Badge
                    key={keyword}
                    variant={consultation.style_keywords?.includes(keyword) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleStyleKeyword(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Colors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {consultation.color_palette?.primary?.map(color => (
                    <Badge
                      key={color}
                      style={{ backgroundColor: color, color: 'white' }}
                      className="cursor-pointer"
                      onClick={() => removeColorFromPalette('primary', color)}
                    >
                      {color} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  type="color"
                  className="mt-2 w-20 h-10"
                  onChange={(e) => addColorToPalette('primary', e.target.value)}
                />
              </div>

              <div>
                <Label>Accent Colors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {consultation.color_palette?.accent?.map(color => (
                    <Badge
                      key={color}
                      style={{ backgroundColor: color, color: 'white' }}
                      className="cursor-pointer"
                      onClick={() => removeColorFromPalette('accent', color)}
                    >
                      {color} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  type="color"
                  className="mt-2 w-20 h-10"
                  onChange={(e) => addColorToPalette('accent', e.target.value)}
                />
              </div>

              <div>
                <Label>Colors to Avoid</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {consultation.color_palette?.avoid?.map(color => (
                    <Badge
                      key={color}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeColorFromPalette('avoid', color)}
                    >
                      {color} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  type="color"
                  className="mt-2 w-20 h-10"
                  onChange={(e) => addColorToPalette('avoid', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower className="w-5 h-5" />
                Flower Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Must-Have Flowers</Label>
                <Select onValueChange={(value) => toggleFlower(value, 'must_have')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add must-have flowers" />
                  </SelectTrigger>
                  <SelectContent>
                    {flowers.map(flower => (
                      <SelectItem key={flower.id} value={flower.id}>
                        {flower.name}
                        {flower.variety && ` (${flower.variety})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {consultation.must_have_flowers?.map(flowerId => {
                    const flower = flowers.find(f => f.id === flowerId);
                    return flower ? (
                      <Badge key={flowerId} variant="default">
                        {flower.name}
                        <button
                          className="ml-1"
                          onClick={() => toggleFlower(flowerId, 'must_have')}
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <Label>Flowers to Avoid</Label>
                <Select onValueChange={(value) => toggleFlower(value, 'avoid')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add flowers to avoid" />
                  </SelectTrigger>
                  <SelectContent>
                    {flowers.map(flower => (
                      <SelectItem key={flower.id} value={flower.id}>
                        {flower.name}
                        {flower.variety && ` (${flower.variety})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {consultation.flowers_to_avoid?.map(flowerId => {
                    const flower = flowers.find(f => f.id === flowerId);
                    return flower ? (
                      <Badge key={flowerId} variant="destructive">
                        {flower.name}
                        <button
                          className="ml-1"
                          onClick={() => toggleFlower(flowerId, 'avoid')}
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ceremony Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ceremony Location</Label>
                <Input
                  value={consultation.ceremony_location || ''}
                  onChange={(e) => updateConsultation({ ceremony_location: e.target.value })}
                  placeholder="Venue name and address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Setup Time</Label>
                  <Input
                    type="time"
                    value={consultation.ceremony_setup_time || ''}
                    onChange={(e) => updateConsultation({ ceremony_setup_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Breakdown Time</Label>
                  <Input
                    type="time"
                    value={consultation.ceremony_breakdown_time || ''}
                    onChange={(e) => updateConsultation({ ceremony_breakdown_time: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Reception Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Reception Location</Label>
                <Input
                  value={consultation.reception_location || ''}
                  onChange={(e) => updateConsultation({ reception_location: e.target.value })}
                  placeholder="Venue name and address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Setup Time</Label>
                  <Input
                    type="time"
                    value={consultation.reception_setup_time || ''}
                    onChange={(e) => updateConsultation({ reception_setup_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Breakdown Time</Label>
                  <Input
                    type="time"
                    value={consultation.reception_breakdown_time || ''}
                    onChange={(e) => updateConsultation({ reception_breakdown_time: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Venue Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={consultation.venue_restrictions || ''}
                onChange={(e) => updateConsultation({ venue_restrictions: e.target.value })}
                placeholder="Any restrictions on candles, petals, setup times, vendor access, etc.?"
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recording Tab */}
        <TabsContent value="recording" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Audio Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Audio URL</Label>
                <Input
                  value={consultation.audio_url || ''}
                  onChange={(e) => updateConsultation({ audio_url: e.target.value })}
                  placeholder="URL to audio recording"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={consultation.transcript || ''}
                onChange={(e) => updateConsultation({ transcript: e.target.value })}
                placeholder="Consultation transcript will appear here..."
                rows={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                General Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={consultation.notes || ''}
                onChange={(e) => updateConsultation({ notes: e.target.value })}
                placeholder="Add any additional notes from the consultation..."
                rows={6}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Follow-Up Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Next Meeting Date</Label>
                <Input
                  type="datetime-local"
                  value={consultation.next_meeting_date || ''}
                  onChange={(e) => updateConsultation({ next_meeting_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Action Items</Label>
                <Textarea
                  value={consultation.follow_up_items?.join('\n') || ''}
                  onChange={(e) => updateConsultation({ 
                    follow_up_items: e.target.value.split('\n').filter(item => item.trim()) 
                  })}
                  placeholder="Enter action items (one per line)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventConsultation;