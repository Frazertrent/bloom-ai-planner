import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Plus, 
  FileAudio,
  TrendingUp,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

// Mock data
const stats = [
  {
    title: "Revenue This Month",
    value: "$24,580",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-success"
  },
  {
    title: "Active Events",
    value: "8",
    change: "+2 new",
    icon: Calendar,
    color: "text-primary"
  },
  {
    title: "Pending Consultations",
    value: "3",
    change: "Need review",
    icon: FileAudio,
    color: "text-warning"
  },
  {
    title: "Total Clients",
    value: "127",
    change: "+5 this week",
    icon: Users,
    color: "text-accent-gold"
  }
];

const upcomingEvents = [
  {
    id: 1,
    client: "Sarah & Michael Johnson",
    event: "Wedding Reception",
    date: "2024-03-15",
    venue: "Rosewood Manor",
    status: "Planning",
    budget: "$8,500",
    statusColor: "bg-warning/20 text-warning-foreground"
  },
  {
    id: 2,
    client: "Emily Chen",
    event: "Corporate Gala",
    date: "2024-03-18",
    venue: "Grand Ballroom",
    status: "Approved",
    budget: "$12,000",
    statusColor: "bg-success/20 text-success-foreground"
  },
  {
    id: 3,
    client: "David & Lisa Park",
    event: "Anniversary Party",
    date: "2024-03-22",
    venue: "Garden Terrace",
    status: "Consultation",
    budget: "$3,500",
    statusColor: "bg-accent/20 text-accent-foreground"
  },
  {
    id: 4,
    client: "Thompson Foundation",
    event: "Charity Fundraiser",
    date: "2024-03-25",
    venue: "City Convention Center",
    status: "Completed",
    budget: "$15,500",
    statusColor: "bg-muted text-muted-foreground"
  }
];

const recentActivity = [
  {
    id: 1,
    action: "New consultation uploaded",
    client: "Jennifer Martinez",
    time: "2 hours ago",
    icon: FileAudio
  },
  {
    id: 2,
    action: "Event proposal approved",
    client: "Sarah & Michael Johnson",
    time: "5 hours ago",
    icon: Calendar
  },
  {
    id: 3,
    action: "Payment received",
    client: "Emily Chen",
    time: "1 day ago",
    icon: DollarSign
  },
  {
    id: 4,
    action: "New client inquiry",
    client: "Robert Williams",
    time: "2 days ago",
    icon: Phone
  }
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your floral business.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileAudio className="w-4 h-4" />
            Upload Consultation
          </Button>
          <Button className="gap-2 bg-gradient-primary hover:shadow-glow">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-card flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-smooth">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.client}</h4>
                      <Badge className={event.statusColor}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.event}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.venue}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{event.budget}</p>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.client}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              Schedule Event
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              Add Client
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mail className="w-6 h-6" />
              Send Proposal
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              Generate Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;