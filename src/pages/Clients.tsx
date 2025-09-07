import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Mock client data
const clients = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    avatar: "",
    initials: "SJ",
    status: "Active",
    statusColor: "default",
    totalEvents: 2,
    upcomingEvents: 1,
    totalSpent: 12500,
    joinDate: "2024-01-15",
    location: "Nashville, TN",
    notes: "Prefers soft pastels, no roses",
    events: [
      {
        id: "e1",
        name: "Sarah's Wedding",
        date: "2024-12-15",
        type: "Wedding",
        status: "Planning",
        venue: "Belle Meade Plantation"
      },
      {
        id: "e2", 
        name: "Bridal Portraits",
        date: "2024-11-20",
        type: "Photography",
        status: "Completed",
        venue: "Cheekwood Gardens"
      }
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com", 
    phone: "(555) 987-6543",
    avatar: "",
    initials: "MC",
    status: "Active",
    statusColor: "default",
    totalEvents: 1,
    upcomingEvents: 1,
    totalSpent: 8500,
    joinDate: "2024-02-20",
    location: "Franklin, TN",
    notes: "Corporate event specialist",
    events: [
      {
        id: "e3",
        name: "Company Gala",
        date: "2024-10-30",
        type: "Corporate",
        status: "Approved",
        venue: "Music City Center"
      }
    ]
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.r@email.com",
    phone: "(555) 456-7890", 
    avatar: "",
    initials: "ER",
    status: "Lead",
    statusColor: "secondary",
    totalEvents: 0,
    upcomingEvents: 0,
    totalSpent: 0,
    joinDate: "2024-03-10",
    location: "Brentwood, TN",
    notes: "Interested in spring wedding package",
    events: []
  },
  {
    id: "4",
    name: "David & Lisa Thompson",
    email: "thompson.wedding@email.com",
    phone: "(555) 234-5678",
    avatar: "",
    initials: "DL",
    status: "Active", 
    statusColor: "default",
    totalEvents: 3,
    upcomingEvents: 0,
    totalSpent: 18750,
    joinDate: "2023-11-05",
    location: "Murfreesboro, TN",
    notes: "Repeat clients - annual anniversary flowers",
    events: [
      {
        id: "e4",
        name: "Wedding Ceremony",
        date: "2023-12-20",
        type: "Wedding",
        status: "Completed",  
        venue: "The Hermitage Hotel"
      },
      {
        id: "e5",
        name: "1st Anniversary",
        date: "2024-02-14",
        type: "Anniversary",
        status: "Completed",
        venue: "Home Delivery"
      }
    ]
  }
];

const getClientsByStatus = (status: string) => {
  if (status === "All") return clients;
  return clients.filter(client => client.status === status);
};

const ClientCard = ({ client }: { client: typeof clients[0] }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={client.avatar} alt={client.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {client.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {client.location}
            </CardDescription>
          </div>
        </div>
        <Badge variant={client.statusColor as any}>{client.status}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          {client.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          {client.phone}
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{client.totalEvents}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{client.upcomingEvents}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">${(client.totalSpent / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Total Spent</div>
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/clients/${client.id}`}>
              View Details
            </Link>
          </Button>
          <Button variant="default" size="sm" className="flex-1">
            New Event
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredClients = getClientsByStatus(activeTab).filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "Active").length,
    leads: clients.filter(c => c.status === "Lead").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships and event history</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

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
            <div className="text-2xl font-bold text-secondary">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
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
          <TabsTrigger value="Active">Active ({clients.filter(c => c.status === "Active").length})</TabsTrigger>
          <TabsTrigger value="Lead">Leads ({clients.filter(c => c.status === "Lead").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <div className="text-muted-foreground mb-4">
                {searchQuery ? "No clients found matching your search." : "No clients found."}
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Client
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}