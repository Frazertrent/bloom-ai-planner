// src/pages/NewEvent.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

const NewEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID if editing
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    event_type: '',
    event_date: '',
    guest_count: '',
    budget_target: '',
    venue_name: '',
    venue_address: '',
    client_first_name: '',
    client_last_name: '',
    client_email: '',
    client_phone: '',
    special_instructions: '',
    status: 'consultation'
  });

  // Helper function to convert timestamptz to YYYY-MM-DD format
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch event data if editing
  useEffect(() => {
    const fetchEventData = async () => {
      if (!isEditing || !id) return;

      try {
        setFetchingEvent(true);
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

        // Extract venue data
        const venues = (eventData.venues as unknown) as Venue[] || [];
        const primaryVenue = venues[0];

        // Extract client data
        const client = (eventData.clients as unknown) as Client;

        // FIXED: Convert timestamptz to YYYY-MM-DD format for date input
        setFormData({
          title: eventData.title || '',
          event_type: eventData.event_type || '',
          event_date: formatDateForInput(eventData.event_date),
          guest_count: eventData.guest_count?.toString() || '',
          budget_target: eventData.budget_target?.toString() || '',
          venue_name: primaryVenue?.name || '',
          venue_address: primaryVenue?.address || '',
          client_first_name: client?.first_name || '',
          client_last_name: client?.last_name || '',
          client_email: client?.email || '',
          client_phone: client?.phone || '',
          special_instructions: eventData.special_instructions || '',
          status: eventData.status || 'consultation'
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event data');
      } finally {
        setFetchingEvent(false);
      }
    };

    fetchEventData();
  }, [id, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const organizationId = profile.organization_id;

      if (isEditing && id) {
        // Update existing event
        
        // First, check if we need to update the client
        const { data: existingEvent } = await supabase
          .from('events')
          .select('client_id')
          .eq('id', id)
          .single();

        const clientId = existingEvent?.client_id;

        // Check if client information has changed
        if (formData.client_email) {
          const { data: existingClient } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

          // Update client if information has changed
          if (existingClient && (
            existingClient.first_name !== formData.client_first_name ||
            existingClient.last_name !== formData.client_last_name ||
            existingClient.email !== formData.client_email ||
            existingClient.phone !== formData.client_phone
          )) {
            const { error: clientUpdateError } = await supabase
              .from('clients')
              .update({
                first_name: formData.client_first_name,
                last_name: formData.client_last_name,
                email: formData.client_email || null,
                phone: formData.client_phone || null,
              })
              .eq('id', clientId);

            if (clientUpdateError) throw clientUpdateError;
          }
        }

        // Update the event
        const venueData = formData.venue_name ? [{
          name: formData.venue_name,
          address: formData.venue_address
        }] : [];

        // The date input already gives us YYYY-MM-DD format, which Postgres can handle directly
        const { error: eventUpdateError } = await supabase
          .from('events')
          .update({
            title: formData.title,
            event_type: formData.event_type,
            event_date: formData.event_date ? formData.event_date : null,
            guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
            budget_target: formData.budget_target ? parseFloat(formData.budget_target) : null,
            venues: venueData,
            status: formData.status,
            special_instructions: formData.special_instructions || null
          })
          .eq('id', id);

        if (eventUpdateError) throw eventUpdateError;

        toast({
          title: 'Success',
          description: 'Event updated successfully'
        });

        // Navigate back to event detail page
        navigate(`/events/${id}`);
      } else {
        // Create new event
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('email', formData.client_email)
          .eq('organization_id', organizationId)
          .maybeSingle();

        let clientId;

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              first_name: formData.client_first_name,
              last_name: formData.client_last_name,
              email: formData.client_email,
              phone: formData.client_phone,
              organization_id: organizationId
            })
            .select('id')
            .single();

          if (clientError) throw clientError;
          clientId = newClient.id;
        }

        const venueData = formData.venue_name ? [{
          name: formData.venue_name,
          address: formData.venue_address
        }] : [];

        // The date input already gives us YYYY-MM-DD format, which Postgres can handle directly
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            title: formData.title,
            event_type: formData.event_type,
            event_date: formData.event_date ? formData.event_date : null,
            guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
            budget_target: formData.budget_target ? parseFloat(formData.budget_target) : null,
            venues: venueData,
            client_id: clientId,
            organization_id: organizationId,
            status: formData.status,
            special_instructions: formData.special_instructions || null
          });

        if (eventError) throw eventError;

        toast({
          title: 'Success',
          description: 'Event created successfully'
        });

        // Navigate back to events page
        navigate('/events');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err instanceof Error ? err.message : 'Failed to save event');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(isEditing ? `/events/${id}` : '/events')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Event' : 'New Event'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update event details and client information.' : 'Create a new floral event and add client details.'}
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {fetchingEvent ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Wedding Reception, Corporate Gala"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleInputChange('event_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="funeral">Funeral</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => handleInputChange('event_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_count">Guest Count</Label>
                    <Input
                      id="guest_count"
                      type="number"
                      value={formData.guest_count}
                      onChange={(e) => handleInputChange('guest_count', e.target.value)}
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget_target">Budget Target</Label>
                  <Input
                    id="budget_target"
                    type="number"
                    step="0.01"
                    value={formData.budget_target}
                    onChange={(e) => handleInputChange('budget_target', e.target.value)}
                    placeholder="e.g., 5000.00"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_first_name">First Name *</Label>
                    <Input
                      id="client_first_name"
                      value={formData.client_first_name}
                      onChange={(e) => handleInputChange('client_first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_last_name">Last Name *</Label>
                    <Input
                      id="client_last_name"
                      value={formData.client_last_name}
                      onChange={(e) => handleInputChange('client_last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="client_email">Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Venue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => handleInputChange('venue_name', e.target.value)}
                    placeholder="e.g., Rosewood Manor"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_address">Venue Address</Label>
                  <Textarea
                    id="venue_address"
                    value={formData.venue_address}
                    onChange={(e) => handleInputChange('venue_address', e.target.value)}
                    placeholder="123 Garden Way, City, State 12345"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea
                    id="special_instructions"
                    value={formData.special_instructions}
                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                    placeholder="Any special requirements, preferences, or notes..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEditing ? `/events/${id}` : '/events')}
              disabled={loading || fetchingEvent}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || fetchingEvent}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewEvent;