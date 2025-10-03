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
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  Loader2,
  FileText,
  Palette,
  Flower,
  Plus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import the tab components (we'll create these next)
import EventOverview from '@/components/events/EventOverview.tsx';
import EventBudget from '@/components/events/EventBudget.tsx';
import EventTimeline from '@/components/events/EventTimeline.tsx';
import EventTeam from '@/components/events/EventTeam.tsx';

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

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      consultation: 'bg-blue-100 text-blue-800',
      planning: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[event.status] || 'bg-gray-100 text-gray-800'}>
        {event.status}
      </Badge>
    );
  };

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

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EventOverview eventId={id!} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <EventBudget eventId={id!} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <EventTimeline eventId={id!} />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <EventTeam eventId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetail;