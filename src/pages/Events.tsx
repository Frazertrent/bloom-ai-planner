import { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const events = [
  {
    id: 1,
    client: "Sarah & Michael Johnson",
    event: "Wedding Reception",
    date: "2024-03-15",
    venue: "Rosewood Manor",
    status: "Planning",
    budget: "$8,500",
    guests: 120,
    statusColor: "bg-warning/20 text-warning-foreground",
    progress: 65
  },
  {
    id: 2,
    client: "Emily Chen",
    event: "Corporate Gala",
    date: "2024-03-18",
    venue: "Grand Ballroom",
    status: "Approved",
    budget: "$12,000",
    guests: 200,
    statusColor: "bg-success/20 text-success-foreground",
    progress: 90
  },
  {
    id: 3,
    client: "David & Lisa Park",
    event: "Anniversary Party",
    date: "2024-03-22",
    venue: "Garden Terrace",
    status: "Consultation",
    budget: "$3,500",
    guests: 50,
    statusColor: "bg-accent/20 text-accent-foreground",
    progress: 25
  },
  {
    id: 4,
    client: "Thompson Foundation",
    event: "Charity Fundraiser",
    date: "2024-03-25",
    venue: "City Convention Center",
    status: "Completed",
    budget: "$15,500",
    guests: 300,
    statusColor: "bg-muted text-muted-foreground",
    progress: 100
  },
  {
    id: 5,
    client: "Jennifer Martinez",
    event: "Birthday Celebration",
    date: "2024-04-02",
    venue: "Sunset Rooftop",
    status: "Planning",
    budget: "$2,800",
    guests: 35,
    statusColor: "bg-warning/20 text-warning-foreground",
    progress: 40
  }
];

const getEventsByStatus = (status: string) => {
  if (status === 'all') return events;
  return events.filter(event => event.status.toLowerCase() === status);
};

const EventCard = ({ event }: { event: any }) => (
  <Card className="shadow-card hover:shadow-elegant transition-smooth">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{event.client}</h3>
          <p className="text-muted-foreground">{event.event}</p>
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
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
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
            {event.date}
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
      
      <div className="flex gap-2 mt-4">
        <Button size="sm" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredEvents = getEventsByStatus(activeTab).filter(event =>
    event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
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
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;