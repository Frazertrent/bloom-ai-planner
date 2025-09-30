import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Phone, Mail, MapPin, Loader2, Eye, Edit } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status?: string;
  address?: Address;
  events_count?: number;
  total_spent?: number;
}

interface ClientStats {
  total: number;
  active: number;
  leads: number;
  totalRevenue: number;
}

const ClientCard = ({ client }: { client: Client }) => {
  const navigate = useNavigate();
  const initials = `${client.first_name?.[0] || ''}${client.last_name?.[0] || ''}`;
  const fullName = `${client.first_name} ${client.last_name}`;
  const location = client.address ? `${client.address.city || ''}, ${client.address.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : '';
  
  const statusColor = client.status === 'active' ? 'default' : 'secondary';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold truncate">{fullName}</h3>
              <Badge variant={statusColor}>
                {client.status || 'Active'}
              </Badge>
            </div>
            
            {location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
            )}
            
            {client.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <Phone className="h-3 w-3" />
                {client.phone}
              </div>
            )}
            
            <div className="flex justify-between text-sm mb-4">
              <div className="text-center">
                <div className="font-semibold text-primary">{client.events_count || 0}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-muted-foreground">0</div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-secondary">
                  ${((client.total_spent || 0) / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Handle client creation
  const handleCreateClient = () => {
    navigate('/clients/new');
  };

  // Handle client editing
  const handleEditClient = (clientId: string) => {
    navigate(`/clients/${clientId}/edit`);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (clientsError) throw clientsError;

        // Transform the data to match our interface
        const transformedClients: Client[] = (clientsData || []).map(client => ({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email || undefined,
          phone: client.phone || undefined,
          status: client.status || undefined,
          address: client.address as Address || undefined,
          events_count: client.events_count || undefined,
          total_spent: client.total_spent || undefined,
        }));

        setClients(transformedClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Calculate stats
  const stats: ClientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    leads: clients.filter(c => c.status === 'prospect').length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  };

  // Filter clients
  const filteredClients = clients
    .filter(client => {
      if (activeTab === "Active") return client.status === "active";
      if (activeTab === "Lead") return client.status === "prospect";
      return true;
    })
    .filter(client => {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
      const email = client.email?.toLowerCase() || '';
      const location = client.address ? `${client.address.city || ''} ${client.address.state || ''}`.toLowerCase() : '';
      
      return fullName.includes(searchLower) || 
             email.includes(searchLower) || 
             location.includes(searchLower);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and event history
          </p>
        </div>
        <Button 
          onClick={handleCreateClient}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-accent">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">New Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-secondary">
              ${(stats.totalRevenue / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Client Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="All">All ({clients.length})</TabsTrigger>
          <TabsTrigger value="Active">
            Active ({clients.filter(c => c.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="Lead">
            Leads ({clients.filter(c => c.status === "prospect").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <div className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No clients found matching your search." 
                  : clients.length === 0 
                    ? "No clients found." 
                    : `No clients in "${activeTab}" category.`
                }
              </div>
              {clients.length === 0 && (
                <Button 
                  onClick={handleCreateClient}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  client={client}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}