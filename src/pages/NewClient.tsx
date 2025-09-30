// src/pages/NewClient.tsx
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

const NewClient = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get client ID if editing
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchingClient, setFetchingClient] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    client_type: '',
    referral_source: '',
    status: 'active',
    notes: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: ''
  });

  // Fetch client data if editing
  useEffect(() => {
    const fetchClientData = async () => {
      if (!isEditing || !id) return;

      try {
        setFetchingClient(true);
        setError(null);

        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) throw clientError;

        // Populate form with existing client data
        const address = (clientData.address as unknown) as { street?: string; city?: string; state?: string; zip?: string } || {};
        
        setFormData({
          first_name: clientData.first_name || '',
          last_name: clientData.last_name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          client_type: clientData.client_type || '',
          referral_source: clientData.referral_source || '',
          status: clientData.status || 'active',
          notes: clientData.notes || '',
          address_street: address.street || '',
          address_city: address.city || '',
          address_state: address.state || '',
          address_zip: address.zip || ''
        });
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch client data');
      } finally {
        setFetchingClient(false);
      }
    };

    fetchClientData();
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

      // Prepare address data
      const address = formData.address_street ? {
        street: formData.address_street,
        city: formData.address_city,
        state: formData.address_state,
        zip: formData.address_zip
      } : null;

      if (isEditing && id) {
        // Update existing client
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            client_type: formData.client_type || null,
            referral_source: formData.referral_source || null,
            status: formData.status,
            notes: formData.notes || null,
            address: address,
          })
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        // Create new client
        const { error: createError } = await supabase
          .from('clients')
          .insert({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            client_type: formData.client_type || null,
            referral_source: formData.referral_source || null,
            status: formData.status,
            notes: formData.notes || null,
            address: address,
            organization_id: organizationId
          });

        if (createError) throw createError;
      }

      // Navigate back to clients page or client detail if editing
      if (isEditing) {
        navigate(`/clients/${id}`);
      } else {
        navigate('/clients');
      }
    } catch (err) {
      console.error('Error saving client:', err);
      setError(err instanceof Error ? err.message : 'Failed to save client');
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
          onClick={() => navigate('/clients')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Client' : 'New Client'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update client information.' : 'Add a new client to your customer database.'}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Select
                  value={formData.client_type}
                  onValueChange={(value) => handleInputChange('client_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="venue">Venue Partner</SelectItem>
                    <SelectItem value="planner">Wedding Planner</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address_street">Street Address</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => handleInputChange('address_street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="address_state">State</Label>
                  <Input
                    id="address_state"
                    value={formData.address_state}
                    onChange={(e) => handleInputChange('address_state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_zip">ZIP Code</Label>
                <Input
                  id="address_zip"
                  value={formData.address_zip}
                  onChange={(e) => handleInputChange('address_zip', e.target.value)}
                  placeholder="12345"
                />
              </div>

              <div>
                <Label htmlFor="referral_source">Referral Source</Label>
                <Select
                  value={formData.referral_source}
                  onValueChange={(value) => handleInputChange('referral_source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did they find you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="venue">Venue Partner</SelectItem>
                    <SelectItem value="google">Google Search</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this client..."
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
            onClick={() => navigate(isEditing ? `/clients/${id}` : '/clients')}
            disabled={loading || fetchingClient}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || fetchingClient}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Update Client' : 'Create Client'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClient;