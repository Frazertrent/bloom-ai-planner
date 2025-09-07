import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Target,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Clock,
  Star,
  Repeat,
  UserCheck,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Award,
  AlertTriangle
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  Pie
} from "recharts";

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 28450, profit: 8535, lastYear: 25400 },
  { month: 'Feb', revenue: 31200, profit: 9360, lastYear: 28900 },
  { month: 'Mar', revenue: 45680, profit: 13704, lastYear: 37450 },
  { month: 'Apr', revenue: 52300, profit: 15690, lastYear: 41200 },
  { month: 'May', revenue: 78900, profit: 23670, lastYear: 62100 },
  { month: 'Jun', revenue: 95600, profit: 28680, lastYear: 78300 }
];

const eventTypeData = [
  { type: 'Weddings', revenue: 156000, events: 45, avgValue: 3467 },
  { type: 'Corporate', revenue: 89000, events: 28, avgValue: 3179 },
  { type: 'Personal', revenue: 34000, events: 67, avgValue: 507 },
  { type: 'Sympathy', revenue: 23000, events: 89, avgValue: 258 }
];

const leadSourceData = [
  { source: 'Website', leads: 145, conversions: 65, rate: 45 },
  { source: 'Venue Referrals', leads: 89, conversions: 64, rate: 72 },
  { source: 'Social Media', leads: 234, conversions: 66, rate: 28 },
  { source: 'Client Referrals', leads: 67, conversions: 60, rate: 89 },
  { source: 'Google Ads', leads: 123, conversions: 39, rate: 32 }
];

const satisfactionData = [
  { name: 'Excellent', value: 68, color: '#4A6741' },
  { name: 'Good', value: 24, color: '#87A96B' },
  { name: 'Average', value: 6, color: '#E8B4A0' },
  { name: 'Poor', value: 2, color: '#FF6B6B' }
];

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30days");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Analytics</h1>
          <p className="text-muted-foreground">Data-driven insights to grow your floral business</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">$331,180</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>14.2% vs last year</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">30.1%</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>2.3% improvement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Growth Rate</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">18.7%</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>Above target</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Events Completed</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">229</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>34 this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="revenue">Revenue & Profitability</TabsTrigger>
          <TabsTrigger value="events">Event Performance</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="financial">Financial Health</TabsTrigger>
        </TabsList>

        {/* Revenue & Profitability Dashboard */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Monthly revenue and profit comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#4A6741" strokeWidth={2} name="This Year Revenue" />
                      <Line type="monotone" dataKey="lastYear" stroke="#87A96B" strokeWidth={2} strokeDasharray="5 5" name="Last Year Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#E8B4A0" strokeWidth={2} name="Profit" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue by Event Type
                </CardTitle>
                <CardDescription>Performance breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTypeData.map((event, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{event.type}</span>
                        <span>${event.revenue.toLocaleString()}</span>
                      </div>
                      <Progress value={(event.revenue / 156000) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{event.events} events</span>
                        <span>Avg: ${event.avgValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Performance Analysis</CardTitle>
              <CardDescription>Revenue patterns throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#4A6741" fill="#4A6741" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Performance Analytics */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">On-Time Delivery</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">94%</div>
                  <Progress value={94} className="mt-2 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Client Satisfaction</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">4.8/5.0</div>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Repeat Clients</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">34%</div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>8% increase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Referral Rate</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">2.3</div>
                  <div className="text-xs text-muted-foreground mt-1">per event</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Client Satisfaction Breakdown
              </CardTitle>
              <CardDescription>Distribution of client feedback ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={satisfactionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {satisfactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Analytics */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Analysis</CardTitle>
                <CardDescription>Performance by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadSourceData.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.source}</span>
                        <Badge variant={source.rate > 50 ? "default" : "secondary"}>
                          {source.rate}% conversion
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{source.leads} leads</span>
                        <span>{source.conversions} conversions</span>
                      </div>
                      <Progress value={source.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Lifetime Value</CardTitle>
                <CardDescription>Average value and retention metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">$4,247</div>
                    <div className="text-sm text-muted-foreground">Average CLV</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">18 months</div>
                    <div className="text-sm text-muted-foreground">Avg Relationship</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">1-Year Retention</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-sm">2-Year Retention</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-sm">3+ Year Retention</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Analytics */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Setup Efficiency</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-xs text-muted-foreground mt-1">of planned time</div>
                  <Progress value={87} className="mt-2 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Response Time</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">4.2h</div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    <span>1.3h improvement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Proposal Success</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-xs text-muted-foreground mt-1">acceptance rate</div>
                  <Progress value={68} className="mt-2 h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Analysis */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
                <CardDescription>Your competitive standing in the local market</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Market Share</span>
                  <span className="font-bold">12%</span>
                </div>
                <Progress value={12} className="h-3" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-green-600">+5</div>
                    <div className="text-xs text-muted-foreground">New Competitors</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold text-blue-600">$3,200</div>
                    <div className="text-xs text-muted-foreground">Market Avg Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>Identified market gaps and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Corporate Events</div>
                      <div className="text-sm text-muted-foreground">23% growth opportunity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Subscription Services</div>
                      <div className="text-sm text-muted-foreground">Emerging trend</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Eco-Friendly Options</div>
                      <div className="text-sm text-muted-foreground">High demand</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Health */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">Financial Health</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">A-</div>
                  <div className="text-xs text-muted-foreground mt-1">Excellent standing</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Cash Flow</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">$23,400</div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>Positive trend</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">A/R Days</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">28</div>
                  <div className="text-xs text-muted-foreground mt-1">days outstanding</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-yellow-600">Low</div>
                  <div className="text-xs text-muted-foreground mt-1">2/10 factors</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Forecasting</CardTitle>
              <CardDescription>Projected performance for next 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$478K</div>
                    <div className="text-sm text-muted-foreground">Projected Revenue</div>
                    <div className="text-xs text-green-600 mt-1">+22% growth</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$143K</div>
                    <div className="text-sm text-muted-foreground">Projected Profit</div>
                    <div className="text-xs text-blue-600 mt-1">30% margin</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">312</div>
                    <div className="text-sm text-muted-foreground">Projected Events</div>
                    <div className="text-xs text-purple-600 mt-1">+36% increase</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;