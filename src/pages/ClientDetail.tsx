// src/pages/ClientDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  Eye,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type?: string;
  status?: string;
  guest_count?: number;
  quoted_amount?: number;
  venues?: Venue[];
}

interface Venue {
  name: string;
  address?: string;
}

interface ClientDetail {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status?: string;
  client_type?: string;
  referral_source?: string;
  address?: Address;
  notes?: string;
  events_count?: number;
  total_spent?: number;
  created_at?: string;
  events?: Event[];
}

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'prospect':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-red-100 text-red-800';
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

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch client details
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) throw clientError;

        // Fetch client's events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, event_date, event_type, status, guest_count, quoted_amount, venues')
          .eq('client_id', id)
          .order('event_date', { ascending: false });

        if (eventsError) throw eventsError;

        // Transform the data
        const transformedClient: ClientDetail = {
          id: clientData.id,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          email: clientData.email || undefined,
          phone: clientData.phone || undefined,
          status: clientData.status || undefined,
          client_type: clientData.client_type || undefined,
          referral_source: clientData.referral_source || undefined,
          address: (clientData.address as unknown) as Address || undefined,
          notes: clientData.notes || undefined,
          events_count: clientData.events_count || undefined,
          total_spent: clientData.total_spent || undefined,
          created_at: clientData.created_at || undefined,
          events: eventsData?.map(event => ({
            ...event,
            venues: (event.venues as unknown) as Venue[] || undefined,
          })) || []
        };

        setClient(transformedClient);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </div>
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              {error || 'Client not found'}
            </div>
            <Button onClick={() => navigate('/clients')} variant="outline">
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${client.first_name} ${client.last_name}`;
  const initials = `${client.first_name[0] || ''}${client.last_name[0] || ''}`;
  const address = client.address;
  const addressString = address ? 
    [address.street, address.city, address.state, address.zip]
      .filter(Boolean)
      .join(', ') : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">
              {client.client_type || 'Client'} • Member since {formatDate(client.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(client.status || '')}>
            {client.status || 'Active'}
          </Badge>
          <Button
            onClick={() => navigate(`/clients/${id}/edit`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {client.email && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <a href={`tel:${client.phone}`} className="font-medium text-blue-600 hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
              </div>

              {addressString && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  <div className="font-medium">{addressString}</div>
                </div>
              )}

              {client.referral_source && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Referral Source</div>
                  <div className="font-medium capitalize">{client.referral_source.replace('_', ' ')}</div>
                </div>
              )}

              {client.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="font-medium">{client.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="events" className="w-full">
            <TabsList>
              <TabsTrigger value="events">Events ({client.events?.length || 0})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="space-y-4">
              {client.events && client.events.length > 0 ? (
                <div className="space-y-4">
                  {client.events.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(event.event_date)}
                              </div>
                              {event.guest_count && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.guest_count} guests
                                </div>
                              )}
                              {event.quoted_amount && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCurrency(event.quoted_amount)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.status && (
                              <Badge variant="outline">
                                {event.status}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      This client hasn't booked any events yet.
                    </p>
                    <Button 
                      onClick={() => navigate('/events/new')}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Client interaction history will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Client documents and contracts will be displayed here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Client Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-semibold">{client.events_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-semibold">{formatCurrency(client.total_spent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Event</span>
                <span className="font-semibold">
                  {client.events_count ? 
                    formatCurrency((client.total_spent || 0) / client.events_count) : 
                    '$0'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client Since</span>
                <span className="font-semibold">{formatDate(client.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/events/new')}
              >
                <Calendar className="w-4 h-4" />
                Create New Event
              </Button>
              {client.email && (
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
              )}
              {client.phone && (
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => window.open(`tel:${client.phone}`, '_blank')}
                >
                  <Phone className="w-4 h-4" />
                  Call Client
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;