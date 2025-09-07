import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, Package, Map as MapIcon, Clock } from "lucide-react";

// Mock client data
const clientData = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    avatar: "",
    initials: "SJ",
    status: "Active",
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
        venue: "Belle Meade Plantation",
        budget: 8500,
        guests: 150
      },
      {
        id: "e2",
        name: "Bridal Portraits",
        date: "2024-11-20",
        type: "Photography",
        status: "Completed",
        venue: "Cheekwood Gardens",
        budget: 1200,
        guests: 8
      }
    ],
    orders: [
      {
        id: "o1",
        eventId: "e1",
        eventName: "Sarah's Wedding",
        date: "2024-12-10",
        items: [
          { name: "Bridal Bouquet", quantity: 1, price: 250 },
          { name: "Bridesmaids Bouquets", quantity: 6, price: 85 },
          { name: "Centerpieces", quantity: 15, price: 120 },
          { name: "Ceremony Arch", quantity: 1, price: 450 }
        ],
        total: 2210,
        status: "Pending"
      }
    ],
    layouts: [
      {
        id: "l1",
        eventId: "e1",
        eventName: "Sarah's Wedding",
        name: "Reception Layout",
        venue: "Belle Meade Plantation",
        tables: 15,
        capacity: 150,
        lastModified: "2024-09-01"
      }
    ],
    schedules: [
      {
        id: "s1",
        eventId: "e1",
        eventName: "Sarah's Wedding",
        tasks: [
          { name: "Order flowers", date: "2024-11-15", status: "Completed" },
          { name: "Prep arrangements", date: "2024-12-13", status: "Pending" },
          { name: "Delivery & setup", date: "2024-12-15", status: "Pending" }
        ]
      }
    ],
    budgets: [
      {
        id: "b1", 
        eventId: "e1",
        eventName: "Sarah's Wedding",
        categories: [
          { name: "Flowers", budgeted: 3000, actual: 2800, remaining: 200 },
          { name: "Hard goods", budgeted: 500, actual: 450, remaining: 50 },
          { name: "Labor", budgeted: 800, actual: 800, remaining: 0 },
          { name: "Delivery", budgeted: 200, actual: 160, remaining: 40 }
        ],
        totalBudget: 4500,
        totalActual: 4210,
        totalRemaining: 290
      }
    ]
  }
};

export default function ClientDetail() {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  const client = clientData[clientId as keyof typeof clientData];
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
        <p className="text-muted-foreground mb-4">The client you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/clients">
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Link>
        </Button>
      </div>

      {/* Client Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  Client since {new Date(client.joinDate).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="default">{client.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {client.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {client.phone}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {client.location}
            </div>
          </div>
          {client.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm"><strong>Notes:</strong> {client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events ({client.events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.venue}</div>
                        <div className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</div>
                      </div>
                      <Badge variant={event.status === 'Completed' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Events</span>
                    <span className="font-semibold">{client.events.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Orders</span>
                    <span className="font-semibold">{client.orders.filter(o => o.status !== 'Completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className="font-semibold">${client.events.reduce((sum, e) => sum + e.budget, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Orders</h3>
            <Button size="sm">New Order</Button>
          </div>
          
          {client.orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order #{order.id.toUpperCase()}</CardTitle>
                    <CardDescription>{order.eventName} • {new Date(order.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>${item.quantity * item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <div className="text-lg font-semibold">Total: ${order.total}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Layouts Tab */}
        <TabsContent value="layouts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Venue Layouts</h3>
            <Button size="sm">New Layout</Button>
          </div>
          
          {client.layouts.map((layout) => (
            <Card key={layout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapIcon className="w-5 h-5" />
                      {layout.name}
                    </CardTitle>
                    <CardDescription>{layout.eventName} • {layout.venue}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Edit Layout</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tables:</span>
                    <div className="font-semibold">{layout.tables}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <div className="font-semibold">{layout.capacity} guests</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Modified:</span>
                    <div className="font-semibold">{new Date(layout.lastModified).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Event Schedules</h3>
            <Button size="sm">New Schedule</Button>
          </div>
          
          {client.schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {schedule.eventName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">{new Date(task.date).toLocaleDateString()}</div>
                      </div>
                      <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Event Budgets</h3>
            <Button size="sm">New Budget</Button>
          </div>
          
          {client.budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {budget.eventName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Budgeted</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budget.categories.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>${category.budgeted}</TableCell>
                        <TableCell>${category.actual}</TableCell>
                        <TableCell className={category.remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                          ${category.remaining}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4 pt-4 border-t space-x-6">
                  <div>
                    <span className="text-muted-foreground">Total Budget: </span>
                    <span className="font-semibold">${budget.totalBudget}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Actual: </span>
                    <span className="font-semibold">${budget.totalActual}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining: </span>
                    <span className={`font-semibold ${budget.totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${budget.totalRemaining}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client History</CardTitle>
              <CardDescription>Complete timeline of interactions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                History timeline coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}