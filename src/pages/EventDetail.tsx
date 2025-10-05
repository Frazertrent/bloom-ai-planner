// src/pages/EventDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Calendar,
  MapPin,
  Users,
  Phone,
  Mail,
  Loader2,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventPhase, PHASE_CONFIGS } from '@/types/phase1';  // Adjust the import path as necessary

// Import the tab components
import EventOverview from '@/components/events/EventOverview';
import EventConsultation from '@/components/events/EventConsultation';
import EventBudget from '@/components/events/EventBudget';
import EventTimeline from '@/components/events/EventTimeline';
import EventTeam from '@/components/events/EventTeam';
import EnhancedDesignTab from '@/components/events/EnhancedDesignTab';

interface EventData {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  status: string;
  guest_count: number;
  budget_target: number;
  quoted_amount: number;
  special_instructions?: string;
  
  // Phase tracking
  current_phase: EventPhase;
  order_deadline_date?: string;
  processing_date?: string;
  production_date?: string;
  
  venues: Array<{
    name: string;
    address?: string;
  }>;
  clients: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

// Define which tabs are available in which phases
const TAB_PHASE_VISIBILITY = {
  overview: ['lead', 'consultation', 'design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  consultation: ['consultation', 'design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  budget: ['consultation', 'design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  design: ['design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  timeline: ['design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  team: ['design', 'ordering', 'processing', 'production', 'delivery', 'closeout'],
  orders: ['ordering', 'processing', 'production', 'delivery', 'closeout'],
  production: ['processing', 'production', 'delivery', 'closeout'],
  delivery: ['delivery', 'closeout'],
  financials: ['closeout']
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHiddenTabs, setShowHiddenTabs] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            clients (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent({
          ...data,
          venues: Array.isArray(data.venues)
            ? data.venues.map((venue: { name?: string; address?: string }) => ({
                name: venue.name || '',
                address: venue.address || undefined,
              }))
            : [],
        } as EventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      consultation: 'bg-blue-100 text-blue-800',
      planning: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[event?.status || ''] || 'bg-gray-100 text-gray-800'}>
        {event?.status}
      </Badge>
    );
  };

  const getPhaseBadge = () => {
    console.log('getPhaseBadge called, phase:', event?.current_phase);
    if (!event?.current_phase) return null;
    
    const phaseColors: Record<EventPhase, string> = {
      lead: 'bg-gray-100 text-gray-800',
      consultation: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      ordering: 'bg-orange-100 text-orange-800',
      processing: 'bg-yellow-100 text-yellow-800',
      production: 'bg-green-100 text-green-800',
      delivery: 'bg-cyan-100 text-cyan-800',
      closeout: 'bg-pink-100 text-pink-800'
    };

    const config = PHASE_CONFIGS[event.current_phase];
    
    return (
      <Badge className={phaseColors[event.current_phase]}>
        Phase: {config.label}
      </Badge>
    );
  };

  const isTabVisible = (tabName: string): boolean => {
    if (!event?.current_phase) return tabName === 'overview';
    if (showHiddenTabs) return true; // Show all tabs if user toggles visibility
    
    const visiblePhases = TAB_PHASE_VISIBILITY[tabName as keyof typeof TAB_PHASE_VISIBILITY] || [];
    return visiblePhases.includes(event.current_phase);
  };

  const getVisibleTabs = () => {
    const allTabs = [
      { id: 'overview', label: 'Overview', alwaysVisible: true },
      { id: 'consultation', label: 'Consultation', alwaysVisible: false },
      { id: 'budget', label: 'Budget', alwaysVisible: false },
      { id: 'design', label: 'Design', alwaysVisible: false },
      { id: 'timeline', label: 'Timeline', alwaysVisible: false },
      { id: 'team', label: 'Team', alwaysVisible: false },
      { id: 'orders', label: 'Orders', alwaysVisible: false },
      { id: 'production', label: 'Production', alwaysVisible: false },
      { id: 'delivery', label: 'Delivery', alwaysVisible: false },
      { id: 'financials', label: 'Financials', alwaysVisible: false }
    ];

    return allTabs.filter(tab => tab.alwaysVisible || isTabVisible(tab.id));
  };

  const getHiddenTabsCount = () => {
    const allTabs = ['overview', 'consultation', 'budget', 'design', 'timeline', 'team', 'orders', 'production', 'delivery', 'financials'];
    return allTabs.filter(tab => !isTabVisible(tab)).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Event not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/events')}>
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const visibleTabs = getVisibleTabs();
  
  const hiddenTabsCount = getHiddenTabsCount();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/events')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getPhaseBadge()}
          <Button
            onClick={() => navigate(`/events/${id}/edit`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Event Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-lg text-muted-foreground">
            {event.clients.first_name} {event.clients.last_name}
          </p>
          {event.current_phase && (
            <p className="text-sm text-muted-foreground mt-2">
              {PHASE_CONFIGS[event.current_phase].description}
            </p>
          )}
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Target Budget</span>
                <span className="font-semibold">
                  ${event.budget_target?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quoted Amount</span>
                <span className="font-semibold">
                  ${event.quoted_amount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="font-semibold">
                {event.event_date ? formatEventDate(event.event_date) : 'TBD'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Venue</p>
              <p className="font-semibold">
                {event.venues?.[0]?.name || 'TBD'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Guest Count</p>
              <p className="font-semibold">{event.guest_count || 0} guests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Event Type</p>
              <p className="font-semibold capitalize">{event.event_type || 'TBD'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">
                {event.clients.first_name} {event.clients.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <a 
                href={`mailto:${event.clients.email}`}
                className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                {event.clients.email}
              </a>
            </div>
            {event.clients.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <a 
                  href={`tel:${event.clients.phone}`}
                  className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  {event.clients.phone}
                </a>
              </div>
            )}
          </div>
          {event.special_instructions && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
              <p className="font-medium">{event.special_instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase-Based Tab Navigation */}
      {hiddenTabsCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {hiddenTabsCount} tab{hiddenTabsCount !== 1 ? 's' : ''} hidden for current phase
              </p>
              <p className="text-xs text-blue-700">
                Tabs will become available as you progress through phases
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHiddenTabs(!showHiddenTabs)}
              className="gap-2"
            >
              {showHiddenTabs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showHiddenTabs ? 'Hide' : 'Show'} All Tabs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${visibleTabs.length <= 4 ? `grid-cols-${visibleTabs.length}` : 'grid-cols-4'}`}>
          {visibleTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={!isTabVisible(tab.id) && showHiddenTabs ? 'opacity-50' : ''}
            >
              {tab.label}
              {!isTabVisible(tab.id) && showHiddenTabs && (
                <span className="ml-1 text-xs">🔒</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EventOverview eventId={id!} />
        </TabsContent>

        {/* NEW CONSULTATION TAB */}
        <TabsContent value="consultation" className="mt-6">
          <EventConsultation eventId={id!} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <EventBudget eventId={id!} />
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <EnhancedDesignTab />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <EventTimeline eventId={id!} />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <EventTeam eventId={id!} />
        </TabsContent>

        {/* Placeholder tabs for future implementation */}
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flower Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order management coming in Phase 2</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Production tracking coming in Phase 2</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Delivery tracking coming in Phase 2</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial reconciliation coming in Phase 2</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetail;