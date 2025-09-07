import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Instagram,
  Facebook,
  Twitter,
  Target,
  BarChart3,
  Heart,
  MapPin,
  Star,
  Send,
  Zap,
  Camera,
  MessageSquare,
  ArrowRight,
  Plus,
  Hash,
  Clock,
  Eye,
  UserCheck,
  Award,
  Palette,
  FileText,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Marketing = () => {
  const [activeTab, setActiveTab] = useState("content");

  // Sample data
  const stats = {
    postsThisMonth: 24,
    engagementRate: 4.2,
    newLeads: 8,
    revenueAttributed: 12500
  };

  const recentPosts = [
    {
      id: 1,
      content: "Behind the scenes of the Miller wedding setup 🌸 Creating magic one bloom at a time!",
      platform: "instagram",
      engagement: 156,
      reach: 2400,
      hashtags: ["#weddingflorals", "#behindthescenes", "#millerwedding"]
    },
    {
      id: 2,
      content: "Seasonal centerpiece featuring local autumn blooms 🍂 Perfect for intimate celebrations",
      platform: "facebook", 
      engagement: 89,
      reach: 1800,
      hashtags: ["#fallwedding", "#seasonalflowers", "#localflorals"]
    }
  ];

  const testimonials = [
    {
      id: 1,
      client: "Sarah Johnson",
      rating: 5,
      text: "Our wedding flowers were absolutely perfect! The arrangements exceeded our expectations.",
      event: "Johnson Wedding",
      date: "2024-08-15",
      photo: null,
      approved: true
    },
    {
      id: 2,
      client: "Michael Chen",
      rating: 5,
      text: "Professional, creative, and so easy to work with. Highly recommend!",
      event: "Corporate Event",
      date: "2024-08-10",
      photo: null,
      approved: false
    }
  ];

  const venues = [
    {
      id: 1,
      name: "Sunset Gardens",
      coordinator: "Emma Williams",
      events: 12,
      relationship: "preferred",
      lastContact: "2024-08-20",
      nextFollowUp: "2024-09-01",
      commissionRate: 10
    },
    {
      id: 2,
      name: "Downtown Event Center", 
      coordinator: "James Mitchell",
      events: 4,
      relationship: "building",
      lastContact: "2024-07-15",
      nextFollowUp: "2024-08-30",
      commissionRate: 8
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: "Wedding Season Prep",
      type: "email",
      status: "active",
      opens: 68,
      clicks: 12,
      conversions: 3
    },
    {
      id: 2,
      name: "Holiday Corporate Events",
      type: "social",
      status: "scheduled",
      opens: 0,
      clicks: 0,
      conversions: 0
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Center</h1>
        <p className="text-muted-foreground">
          Grow your floral business with AI-powered marketing tools and automation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.postsThisMonth}</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.engagementRate}%</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +0.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.newLeads}</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Attributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.revenueAttributed.toLocaleString()}</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +$2,300 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="testimonials">Reviews</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>

        {/* Social Media Content Generator */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI Caption Generator
                </CardTitle>
                <CardDescription>
                  Generate engaging captions for your social media posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Platform</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    "Behind the scenes of the Miller wedding setup 🌸 Creating magic one bloom at a time! 
                    Each arrangement tells a story of love and beauty. #weddingflorals #behindthescenes #millerwedding #floraldesign #weddingday"
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary">#weddingflorals</Badge>
                    <Badge variant="secondary">#behindthescenes</Badge>
                    <Badge variant="secondary">#millerwedding</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Variations
                  </Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Content Calendar
                </CardTitle>
                <CardDescription>
                  Your scheduled posts for this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {post.platform === 'instagram' ? (
                          <Instagram className="h-4 w-4 text-primary" />
                        ) : (
                          <Facebook className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.engagement}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.reach}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scheduled Post
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Trending Hashtags
              </CardTitle>
              <CardDescription>
                Popular hashtags in your area and industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-2">Wedding Season</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">#weddingflorals</Badge>
                    <Badge variant="outline">#bridal</Badge>
                    <Badge variant="outline">#weddingday</Badge>
                    <Badge variant="outline">#bouquet</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Local Area</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">#atlantaflorist</Badge>
                    <Badge variant="outline">#georgiaweddings</Badge>
                    <Badge variant="outline">#localflowers</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Seasonal</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">#fallwedding</Badge>
                    <Badge variant="outline">#autumnblooms</Badge>
                    <Badge variant="outline">#seasonalflowers</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Testimonial Manager */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recent Reviews
                </CardTitle>
                <CardDescription>
                  Manage and showcase client testimonials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{testimonial.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{testimonial.client}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.event}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{testimonial.text}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={testimonial.approved ? "default" : "secondary"}>
                        {testimonial.approved ? "Approved" : "Pending Approval"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Camera className="h-3 w-3 mr-1" />
                          Request Photo
                        </Button>
                        <Button size="sm">
                          <Send className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Review Collection
                </CardTitle>
                <CardDescription>
                  Automated review requests and management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-subtle p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Automatic Review Requests</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send review requests 3 days after event completion
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Automation
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Review Platforms</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Google Reviews</span>
                      <Badge variant="default">4.8/5</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Yelp</span>
                      <Badge variant="default">4.9/5</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">The Knot</span>
                      <Badge variant="default">4.7/5</Badge>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review Platform
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Venue Relationship Management */}
        <TabsContent value="venues" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Venue Partnerships
              </CardTitle>
              <CardDescription>
                Manage relationships with wedding venues and event coordinators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div key={venue.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{venue.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Coordinator: {venue.coordinator}
                        </p>
                      </div>
                      <Badge variant={venue.relationship === 'preferred' ? 'default' : 'secondary'}>
                        {venue.relationship === 'preferred' ? 'Preferred Vendor' : 'Building Relationship'}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Events:</span>
                        <p className="font-medium">{venue.events}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission:</span>
                        <p className="font-medium">{venue.commissionRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Contact:</span>
                        <p className="font-medium">{venue.lastContact}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Follow-up:</span>
                        <p className="font-medium">{venue.nextFollowUp}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Send Note
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule Meeting
                      </Button>
                      <Button size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Portfolio
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add New Venue
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Generation & Conversion */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Lead Pipeline
                </CardTitle>
                <CardDescription>
                  Track and convert inquiries into bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>New Inquiries</span>
                    <span>12</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Consultation Scheduled</span>
                    <span>8</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Proposals Sent</span>
                    <span>6</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bookings Confirmed</span>
                    <span>4</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="bg-success/10 p-3 rounded-lg">
                  <p className="text-sm font-medium text-success">Conversion Rate: 33%</p>
                  <p className="text-xs text-muted-foreground">Above industry average of 25%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Lead Sources
                </CardTitle>
                <CardDescription>
                  Where your best leads are coming from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instagram</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-16 h-2" />
                      <span className="text-xs w-8">35%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Venue Referrals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-16 h-2" />
                      <span className="text-xs w-8">25%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Search</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-16 h-2" />
                      <span className="text-xs w-8">20%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Word of Mouth</span>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-16 h-2" />
                      <span className="text-xs w-8">15%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Other</span>
                    <div className="flex items-center gap-2">
                      <Progress value={15} className="w-16 h-2" />
                      <span className="text-xs w-8">5%</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Performance Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm">Behind-the-scenes content</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg. Engagement: 8.4%</span>
                    <span>+23%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Client testimonials</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg. Engagement: 6.7%</span>
                    <span>+15%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Seasonal arrangements</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg. Engagement: 5.2%</span>
                    <span>+8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Best Posting Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm">Tuesday 7:00 PM</p>
                  <Progress value={90} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Sunday 10:00 AM</p>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Friday 5:00 PM</p>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  <Badge variant="default">4.8% avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <Badge variant="secondary">3.2% avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Pinterest</span>
                  </div>
                  <Badge variant="secondary">2.8% avg</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automated Marketing Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Active Campaigns
              </CardTitle>
              <CardDescription>
                Automated marketing sequences and workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.type} campaign
                      </p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Opens:</span>
                      <p className="font-medium">{campaign.opens}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicks:</span>
                      <p className="font-medium">{campaign.clicks}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversions:</span>
                      <p className="font-medium">{campaign.conversions}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <Button size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Campaign
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Consistency Tools */}
        <TabsContent value="brand" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Brand Guidelines
                </CardTitle>
                <CardDescription>
                  Maintain consistent branding across all materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Color Palette</h4>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full"></div>
                      <div className="w-8 h-8 bg-secondary rounded-full"></div>
                      <div className="w-8 h-8 bg-accent rounded-full"></div>
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Logo Variations</h4>
                    <div className="grid gap-2 grid-cols-2">
                      <div className="border rounded p-3 text-center">
                        <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-1"></div>
                        <p className="text-xs">Primary Logo</p>
                      </div>
                      <div className="border rounded p-3 text-center">
                        <div className="w-8 h-8 border-2 border-primary rounded-full mx-auto mb-1"></div>
                        <p className="text-xs">Secondary</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Typography</h4>
                    <div className="space-y-1">
                      <p className="text-lg font-bold">Heading Font</p>
                      <p className="text-sm">Body text font</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Brand Guidelines
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Template Library
                </CardTitle>
                <CardDescription>
                  Pre-designed templates for consistent messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Wedding Proposal Template</span>
                    <Button size="sm" variant="outline">Use</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Corporate Event Proposal</span>
                    <Button size="sm" variant="outline">Use</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Social Media Post Templates</span>
                    <Button size="sm" variant="outline">Use</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Email Newsletter Template</span>
                    <Button size="sm" variant="outline">Use</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Contract Template</span>
                    <Button size="sm" variant="outline">Use</Button>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;