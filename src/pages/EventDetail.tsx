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
  DollarSign,
  Clock,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Venue {
  name: string;
  address?: string;
}

interface Client {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface EventDetail {
  id: string;
  title: string;
  event_type?: string;
  event_date: string;
  event_start_time?: string;
  event_end_time?: string;
  status?: string;
  guest_count?: number;
  budget_target?: number;
  quoted_amount?: number;
  venues?: Venue[];
  special_instructions?: string;
  clients?: Client;
}

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'consultation':
      return 'bg-blue-100 text-blue-800';
    case 'planning':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount?: number): string => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return 'Not set';
  try {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid Time';
  }
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            clients (
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('id', id)
          .single();

        if (eventError) throw eventError;

        // Transform the data to match our interface
        const transformedEvent: EventDetail = {
          id: eventData.id,
          title: eventData.title,
          event_type: eventData.event_type || undefined,
          event_date: eventData.event_date,
          event_start_time: eventData.event_start_time || undefined,
          event_end_time: eventData.event_end_time || undefined,
          status: eventData.status || undefined,
          guest_count: eventData.guest_count || undefined,
          budget_target: eventData.budget_target || undefined,
          quoted_amount: eventData.quoted_amount || undefined,
          venues: (eventData.venues as unknown) as Venue[] || undefined,
          special_instructions: eventData.special_instructions || undefined,
          clients: (eventData.clients as unknown) as Client || undefined,
        };

        setEvent(transformedEvent);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-8">
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
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              {error || 'Event not found'}
            </div>
            <Button onClick={() => navigate('/events')} variant="outline">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const venues = event.venues || [];
  const primaryVenue = venues[0];
  const client = event.clients;

  return (
    <div className="space-y-8">
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(event.status || '')}>
            {event.status || 'Draft'}
          </Badge>
          <Button
            onClick={() => navigate(`/events/${id}/edit`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Event Date
                  </div>
                  <div className="font-medium">{formatDate(event.event_date)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    Time
                  </div>
                  <div className="font-medium">
                    {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    Guest Count
                  </div>
                  <div className="font-medium">{event.guest_count || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Event Type</div>
                  <div className="font-medium">{event.event_type || 'Not specified'}</div>
                </div>
              </div>

              {primaryVenue && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    Venue
                  </div>
                  <div className="font-medium">{primaryVenue.name}</div>
                  {primaryVenue.address && (
                    <div className="text-sm text-muted-foreground">{primaryVenue.address}</div>
                  )}
                </div>
              )}

              {event.special_instructions && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Special Instructions</div>
                  <div className="font-medium">{event.special_instructions}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Additional event details and planning information will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="budget">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Budget breakdown and financial details will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Project timeline and milestones will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="team">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Team assignments and responsibilities will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Target Budget</span>
                  <span className="font-medium">{formatCurrency(event.budget_target)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quoted Amount</span>
                  <span className="font-medium">{formatCurrency(event.quoted_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">{client.first_name} {client.last_name}</div>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;