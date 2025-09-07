import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  CalendarPlus,
  FileText,
  Star,
  MessageSquare,
  Settings,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Camera
} from 'lucide-react';

const Team = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Sample team data
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Martinez",
      role: "Head Designer",
      avatar: "/api/placeholder/150/150",
      hireDate: "2021-03-15",
      hourlyRate: 28,
      hoursThisPeriod: 38,
      status: "available",
      rating: 4.8,
      skills: ["Advanced Design", "Client Consultation", "Team Leadership"],
      nextAssignment: "Miller Wedding - Saturday 8AM"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Assistant Designer",
      avatar: "/api/placeholder/150/150",
      hireDate: "2022-08-20",
      hourlyRate: 18,
      hoursThisPeriod: 32,
      status: "on-event",
      rating: 4.2,
      skills: ["Arrangement Creation", "Venue Setup", "Design Support"],
      nextAssignment: "Currently at Downtown Event Center"
    },
    {
      id: 3,
      name: "Jennifer Wilson",
      role: "Setup Specialist",
      avatar: "/api/placeholder/150/150",
      hireDate: "2022-01-10",
      hourlyRate: 16,
      hoursThisPeriod: 40,
      status: "available",
      rating: 4.6,
      skills: ["Installation", "Venue Coordination", "Heavy Lifting"],
      nextAssignment: "Available for assignment"
    },
    {
      id: 4,
      name: "David Rodriguez",
      role: "Driver",
      avatar: "/api/placeholder/150/150",
      hireDate: "2023-07-01",
      hourlyRate: 15,
      hoursThisPeriod: 28,
      status: "off-duty",
      rating: 4.0,
      skills: ["Transportation", "Venue Coordination", "Time Management"],
      nextAssignment: "Sunday Corporate Event - 9AM"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'on-event': return 'bg-orange-500';
      case 'off-duty': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'on-event': return 'On Event';
      case 'off-duty': return 'Off Duty';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-xl text-muted-foreground">Manage your floral team, track performance, and optimize scheduling</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
            <Button variant="outline">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Run Payroll Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+1</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">138</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> vs last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Labor Costs This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-amber-600">+8%</span> from target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Efficiency Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="roles">Roles & Skills</TabsTrigger>
          </TabsList>

          {/* Team Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex items-center mt-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)} mr-2`}></div>
                          <span className="text-sm">{getStatusLabel(member.status)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Hourly Rate</p>
                        <p className="font-semibold">${member.hourlyRate}/hr</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hours This Period</p>
                        <p className="font-semibold">{member.hoursThisPeriod}h</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Performance Rating</span>
                        <span className="text-sm font-semibold flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {member.rating}/5
                        </span>
                      </div>
                      <Progress value={member.rating * 20} className="h-2" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Next Assignment</p>
                      <p className="text-sm font-medium">{member.nextAssignment}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Team Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">This Month's Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        92% on-time event completion
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        4.7/5 average client satisfaction
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Zero safety incidents
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Areas for Improvement</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                        Setup time efficiency: 87%
                      </div>
                      <div className="flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                        Training completion: 78%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Upcoming Goals</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 text-blue-500 mr-2" />
                        Complete Q4 safety training
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 text-blue-500 mr-2" />
                        Achieve 95% efficiency rating
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling */}
          <TabsContent value="scheduling" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample schedule entries */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Miller Wedding</h4>
                          <Badge variant="outline">Saturday</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">8:00 AM - 6:00 PM • Sunset Gardens</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">Sarah (Lead)</Badge>
                          <Badge variant="secondary">Michael (Assistant)</Badge>
                          <Badge variant="secondary">Jennifer (Setup)</Badge>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Corporate Event</h4>
                          <Badge variant="outline">Sunday</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">10:00 AM - 4:00 PM • Downtown Event Center</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">Sarah (Lead)</Badge>
                          <Badge variant="secondary">David (Driver)</Badge>
                          <Badge variant="secondary">Jennifer (Setup)</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Add New Assignment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tracking */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Performance</span>
                        <span>{member.rating}/5</span>
                      </div>
                      <Progress value={member.rating * 20} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Setup Efficiency</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Client Satisfaction</span>
                        <span>4.6/5</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reliability Score</span>
                        <span>96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      View Detailed Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payroll */}
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary - Current Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Regular Hours</th>
                        <th className="text-left p-2">Overtime Hours</th>
                        <th className="text-left p-2">Hourly Rate</th>
                        <th className="text-left p-2">Gross Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => {
                        const regularHours = Math.min(member.hoursThisPeriod, 40);
                        const overtimeHours = Math.max(member.hoursThisPeriod - 40, 0);
                        const grossPay = (regularHours * member.hourlyRate) + (overtimeHours * member.hourlyRate * 1.5);
                        
                        return (
                          <tr key={member.id} className="border-b">
                            <td className="p-2">{member.name}</td>
                            <td className="p-2">{member.role}</td>
                            <td className="p-2">{regularHours}h</td>
                            <td className="p-2">{overtimeHours}h</td>
                            <td className="p-2">${member.hourlyRate}/hr</td>
                            <td className="p-2 font-semibold">${grossPay.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-lg font-semibold">
                    Total Payroll: $8,247.50
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button>
                      Process Payroll
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Basic Floral Design</h4>
                    <Progress value={85} className="mb-2" />
                    <p className="text-sm text-muted-foreground">3 of 4 team members completed</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Advanced Arrangement Techniques</h4>
                    <Progress value={60} className="mb-2" />
                    <p className="text-sm text-muted-foreground">2 of 4 team members completed</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Safety Protocols</h4>
                    <Progress value={100} className="mb-2" />
                    <p className="text-sm text-muted-foreground">All team members completed</p>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Training Module
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Certification Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{member.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Floral Design Certification</span>
                          <Badge variant="outline" className="text-green-600">Valid</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Safety Training</span>
                          <Badge variant="outline" className="text-green-600">Current</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>First Aid/CPR</span>
                          <Badge variant="outline" className="text-amber-600">Expires 12/2024</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Holiday Schedule Update</h4>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-sm">Please review the updated holiday schedule for December events...</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">New Safety Protocols</h4>
                      <span className="text-sm text-muted-foreground">1 day ago</span>
                    </div>
                    <p className="text-sm">Updated safety guidelines for venue installations are now available...</p>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recruitment */}
          <TabsContent value="recruitment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1</div>
                    <p className="text-sm text-muted-foreground">Offers Extended</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <p className="text-sm text-muted-foreground">New Hires</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Open Positions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border rounded-lg p-3">
                      <div>
                        <h5 className="font-medium">Assistant Designer</h5>
                        <p className="text-sm text-muted-foreground">Full-time • Posted 5 days ago</p>
                      </div>
                      <Badge variant="outline">3 Applications</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center border rounded-lg p-3">
                      <div>
                        <h5 className="font-medium">Delivery Driver</h5>
                        <p className="text-sm text-muted-foreground">Part-time • Posted 2 days ago</p>
                      </div>
                      <Badge variant="outline">5 Applications</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Skills */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Definitions & Skill Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Head Designer/Lead Florist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Core Responsibilities</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Event planning & design</li>
                          <li>• Client consultation</li>
                          <li>• Team leadership</li>
                          <li>• Complex arrangements</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Required Skills</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 3+ years experience</li>
                          <li>• Design certification</li>
                          <li>• Leadership abilities</li>
                          <li>• Client communication</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Pay Range</p>
                        <p className="text-lg font-semibold">$25-30/hour</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Assistant Designer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Core Responsibilities</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Arrangement creation</li>
                          <li>• Venue setup support</li>
                          <li>• Design assistance</li>
                          <li>• Quality control</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Required Skills</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1+ years experience</li>
                          <li>• Basic design skills</li>
                          <li>• Attention to detail</li>
                          <li>• Team collaboration</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Pay Range</p>
                        <p className="text-lg font-semibold">$16-20/hour</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Setup Specialist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Core Responsibilities</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Installation & setup</li>
                          <li>• Venue coordination</li>
                          <li>• Heavy lifting</li>
                          <li>• Equipment management</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Required Skills</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Physical fitness</li>
                          <li>• Problem-solving</li>
                          <li>• Time management</li>
                          <li>• Safety awareness</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Pay Range</p>
                        <p className="text-lg font-semibold">$15-18/hour</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Team;