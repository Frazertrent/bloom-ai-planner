import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  DollarSign,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Event {
  id: string;
  title: string;
  client_name?: string;
  event_date: string;
  venue: string;
  status: string;
  budget: string;
  guests: number;
  statusColor: string;
  progress: number;
}

const getEventsByStatus = (events: Event[], status: string) => {
  if (status === 'all') return events;
  return events.filter(event => event.status.toLowerCase() === status);
};

const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card hover:shadow-elegant transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{event.client_name}</h3>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={event.statusColor}>
              {event.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{event.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${event.progress}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {event.event_date}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.venue}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              {event.budget}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {event.guests} guests
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full mt-4"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Handle event creation
  const handleCreateEvent = () => {
    navigate('/events/new');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Query events with client data
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            event_date,
            status,
            guest_count,
            quoted_amount,
            budget_target,
            venues,
            clients (
              first_name,
              last_name
            )
          `);

        if (eventsError) throw eventsError;

        // Transform the data to match your existing interface
        const transformedEvents: Event[] = (eventsData || []).map(event => {
          // Get venue name from JSON
          const venues = (event.venues as unknown) as Venue[] || [];
          const venue = venues[0]?.name || 'TBD';
          
          // Format client name
          const client = (event.clients as unknown) as Client;
          const client_name = client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
          
          // Format date
          const event_date = event.event_date ? 
            new Date(event.event_date).toLocaleDateString() : 'TBD';
          
          // Format budget
          const amount = event.quoted_amount || event.budget_target || 0;
          const budget = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amount);
          
          // Determine status color and progress
          const status = event.status || 'draft';
          let statusColor = '';
          let progress = 0;
          
          switch (status.toLowerCase()) {
            case 'consultation':
              statusColor = 'bg-accent/20 text-accent-foreground';
              progress = 25;
              break;
            case 'planning':
              statusColor = 'bg-warning/20 text-warning-foreground';
              progress = 65;
              break;
            case 'approved':
              statusColor = 'bg-success/20 text-success-foreground';
              progress = 90;
              break;
            case 'completed':
              statusColor = 'bg-muted text-muted-foreground';
              progress = 100;
              break;
            default:
              statusColor = 'bg-muted text-muted-foreground';
              progress = 10;
          }

          return {
            id: event.id,
            title: event.title,
            client_name,
            event_date,
            venue,
            status,
            budget,
            guests: event.guest_count || 0,
            statusColor,
            progress
          };
        });

        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = getEventsByStatus(events, activeTab).filter(event =>
    event.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage your floral events and track their progress.
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </div>
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage your floral events and track their progress.
          </p>
        </div>
        <Button 
          onClick={handleCreateEvent}
          className="gap-2 bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="consultation">Consultation</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery 
                    ? "No events match your search criteria."
                    : "Get started by creating your first event."
                  }
                </p>
                <Button className="gap-2 bg-gradient-primary">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;