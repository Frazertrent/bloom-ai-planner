import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  DollarSign, 
  Settings2, 
  Zap, 
  Shield, 
  Bell, 
  Brain, 
  CreditCard,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Palette,
  FileText,
  Calculator,
  Clock,
  Users,
  Package,
  Calendar,
  Link,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const { toast } = useToast();

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const SaveButton = () => (
    <Button 
      onClick={handleSave} 
      disabled={saveStatus === "saving"}
      className="bg-accent hover:bg-accent-gold transition-smooth"
    >
      {saveStatus === "saving" ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Save className="w-4 h-4 mr-2" />
      )}
      {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
    </Button>
  );

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings & Configuration</h1>
            <p className="text-muted-foreground">Customize your AI Florist Platform experience and business settings</p>
          </div>
          <SaveButton />
        </div>
      </div>

      {/* Main Settings Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted p-1">
          <TabsTrigger value="business" className="flex items-center gap-1 text-xs">
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-1 text-xs">
            <DollarSign className="w-3 h-3" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1 text-xs">
            <Settings2 className="w-3 h-3" />
            <span className="hidden sm:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1 text-xs">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
            <Bell className="w-3 h-3" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1 text-xs">
            <Brain className="w-3 h-3" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1 text-xs">
            <CreditCard className="w-3 h-3" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Profile & Branding */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Business Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Configure your business details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue="Bloom & Flourish Florals" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalEntity">Legal Entity</Label>
                  <Input id="legalEntity" defaultValue="Bloom & Flourish Florals LLC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea id="address" rows={3} defaultValue="123 Garden Street&#10;Flower District&#10;Bloomington, FL 32801" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex">
                      <Phone className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="phone" defaultValue="(555) 123-4567" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex">
                      <Mail className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="email" defaultValue="hello@bloomflourish.com" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex">
                    <Globe className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                    <Input id="website" defaultValue="www.bloomflourish.com" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branding Customization */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Branding & Visual Identity
                </CardTitle>
                <CardDescription>
                  Customize your brand appearance and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary text-primary-foreground">BF</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary border-2 border-border"></div>
                      <span className="text-xs text-muted-foreground mt-1">Primary</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-secondary border-2 border-border"></div>
                      <span className="text-xs text-muted-foreground mt-1">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-accent border-2 border-border"></div>
                      <span className="text-xs text-muted-foreground mt-1">Accent</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Business Tagline</Label>
                  <Input id="tagline" defaultValue="Creating Beautiful Moments, One Bloom at a Time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea id="description" rows={3} defaultValue="Full-service floral design studio specializing in weddings, corporate events, and special occasions. We bring your vision to life with fresh, locally-sourced flowers and expert design." />
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Service Area Configuration
                </CardTitle>
                <CardDescription>
                  Define your delivery zones and service boundaries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                    <Input id="serviceRadius" type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Base Delivery Fee</Label>
                    <Input id="deliveryFee" defaultValue="$25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileageRate">Per Mile Rate</Label>
                    <Input id="mileageRate" defaultValue="$0.75" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Premium Service Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Downtown District</Badge>
                    <Badge variant="secondary">Luxury Resort Area</Badge>
                    <Badge variant="secondary">Historic Wedding Venues</Badge>
                    <Button variant="outline" size="sm">Add Area</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing & Financial Settings */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pricing Structure */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Default Pricing Structure
                </CardTitle>
                <CardDescription>
                  Set your base rates and markup percentages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Base Hourly Rate</Label>
                  <div className="flex">
                    <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                    <Input id="hourlyRate" defaultValue="75" />
                    <span className="text-muted-foreground mt-2 ml-2">/hour</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flowerMarkup">Flower Markup</Label>
                    <div className="flex">
                      <Input id="flowerMarkup" defaultValue="35" />
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hardGoodsMarkup">Hard Goods Markup</Label>
                    <div className="flex">
                      <Input id="hardGoodsMarkup" defaultValue="25" />
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rushFee">Rush Order Fee</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="rushFee" defaultValue="150" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupFee">Setup Fee</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="setupFee" defaultValue="100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Payment Terms & Policies
                </CardTitle>
                <CardDescription>
                  Configure deposit requirements and payment schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="depositPercent">Deposit Percentage</Label>
                  <Select defaultValue="50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                  <Select defaultValue="50-50">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50-50">50% Deposit, 50% Final</SelectItem>
                      <SelectItem value="25-50-25">25% Booking, 50% 30 Days, 25% Final</SelectItem>
                      <SelectItem value="33-33-34">3 Equal Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Payment Fee</Label>
                  <div className="flex">
                    <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                    <Input id="lateFee" defaultValue="25" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input id="gracePeriod" type="number" defaultValue="7" />
                </div>
              </CardContent>
            </Card>

            {/* Tax Configuration */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Tax Configuration
                </CardTitle>
                <CardDescription>
                  Configure sales tax rates and exemptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salesTax">Sales Tax Rate</Label>
                    <div className="flex">
                      <Input id="salesTax" defaultValue="8.25" />
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laborTax">Labor Tax Treatment</Label>
                    <Select defaultValue="exempt">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exempt">Tax Exempt</SelectItem>
                        <SelectItem value="taxable">Taxable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTax">Delivery Tax Treatment</Label>
                    <Select defaultValue="taxable">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exempt">Tax Exempt</SelectItem>
                        <SelectItem value="taxable">Taxable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational Preferences */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Event Management */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Management Defaults
                </CardTitle>
                <CardDescription>
                  Standard workflows and automation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultationDuration">Consultation Duration</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposalTurnaround">Proposal Turnaround</Label>
                  <Select defaultValue="48">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                      <SelectItem value="120">5 business days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Follow-up</Label>
                    <p className="text-sm text-muted-foreground">Automatically schedule follow-ups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Quality Control Checklists</Label>
                    <p className="text-sm text-muted-foreground">Require completion before events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Inventory & Ordering */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Inventory & Ordering
                </CardTitle>
                <CardDescription>
                  Supplier management and ordering preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Suppliers</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Wholesale Flowers Inc.</Badge>
                    <Badge variant="secondary">Garden Fresh Supply</Badge>
                    <Badge variant="secondary">Premium Blooms Co.</Badge>
                    <Button variant="outline" size="sm">Add Supplier</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderSchedule">Standard Order Schedule</Label>
                  <Select defaultValue="tuesday-friday">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday-thursday">Monday & Thursday</SelectItem>
                      <SelectItem value="tuesday-friday">Tuesday & Friday</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Standard Lead Time (days)</Label>
                  <Input id="leadTime" type="number" defaultValue="3" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reorder</Label>
                    <p className="text-sm text-muted-foreground">Automatically reorder based on inventory levels</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Staffing Defaults */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Staffing & Team Management
                </CardTitle>
                <CardDescription>
                  Default staffing requirements and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designerRate">Lead Designer Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="designerRate" defaultValue="28" />
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assistantRate">Assistant Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="assistantRate" defaultValue="18" />
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupRate">Setup Crew Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="setupRate" defaultValue="16" />
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverRate">Driver Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input id="driverRate" defaultValue="15" />
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Management */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar Integrations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Calendar Integrations
                </CardTitle>
                <CardDescription>
                  Connect your calendars for seamless scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Microsoft Outlook</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accounting Software */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Accounting Software
                </CardTitle>
                <CardDescription>
                  Integrate with your accounting platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">QuickBooks Online</p>
                      <p className="text-sm text-muted-foreground">Last sync: 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Syncing
                    </Badge>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Xero</p>
                      <p className="text-sm text-muted-foreground">Available for connection</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Marketing */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-primary" />
                  Social Media & Marketing
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts for marketing automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Instagram Business</p>
                        <p className="text-sm text-muted-foreground">Auto-posting enabled</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Facebook Business</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security & Privacy Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Access Management */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  User Access Management
                </CardTitle>
                <CardDescription>
                  Control user permissions and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all team members</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select defaultValue="120">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, mixed case, numbers)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (15+ chars, special characters)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Data Protection & Privacy
                </CardTitle>
                <CardDescription>
                  Configure data backup and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Data Retention (years)</Label>
                  <Select defaultValue="7">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 years</SelectItem>
                      <SelectItem value="5">5 years</SelectItem>
                      <SelectItem value="7">7 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>GDPR Compliance</Label>
                    <p className="text-sm text-muted-foreground">Enable EU privacy regulations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Export</Label>
                    <p className="text-sm text-muted-foreground">Allow clients to export their data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security Monitoring */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Security Monitoring & Alerts
                </CardTitle>
                <CardDescription>
                  Monitor security events and configure alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Failed Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alert after 3 failed attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Unusual Activity Detection</Label>
                      <p className="text-sm text-muted-foreground">Monitor for suspicious behavior</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Device Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alert on new device logins</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Access Monitoring</Label>
                      <p className="text-sm text-muted-foreground">Track third-party integrations</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification & Communication Preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Business Notifications */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Business Notifications
                </CardTitle>
                <CardDescription>
                  Configure alerts for business operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Inquiries</Label>
                      <p className="text-sm text-muted-foreground">Email + SMS immediately</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Confirmations</Label>
                      <p className="text-sm text-muted-foreground">Email receipt + dashboard alert</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">1 week, 3 days, day-of notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Team Schedule Changes</Label>
                      <p className="text-sm text-muted-foreground">Notify affected team members</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Communications */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Client Communications
                </CardTitle>
                <CardDescription>
                  Automated client email and SMS settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeEmail">Welcome Email Template</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional & Detailed</SelectItem>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="luxury">Luxury & Elegant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followupTiming">Follow-up Schedule</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate responses</SelectItem>
                      <SelectItem value="standard">24-48 hour follow-ups</SelectItem>
                      <SelectItem value="relaxed">3-5 day follow-ups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS for urgent updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Review Requests</Label>
                    <p className="text-sm text-muted-foreground">Auto-request reviews post-event</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Marketing Communications */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-primary" />
                  Marketing Communications
                </CardTitle>
                <CardDescription>
                  Social media and promotional messaging settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Social Media Posting</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-post Event Photos</Label>
                        <p className="text-sm text-muted-foreground">Share completed events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Seasonal Campaigns</Label>
                        <p className="text-sm text-muted-foreground">Automated holiday promotions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Marketing</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monthly Newsletter</Label>
                        <p className="text-sm text-muted-foreground">Send to client mailing list</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Venue Relationship Updates</Label>
                        <p className="text-sm text-muted-foreground">Share with partner venues</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI & Automation Configuration */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Assistant Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Assistant Behavior
                </CardTitle>
                <CardDescription>
                  Configure AI learning and suggestion preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiCreativity">Design Creativity Level</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetAccuracy">Budget Estimation</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (higher estimates)</SelectItem>
                      <SelectItem value="balanced">Balanced approach</SelectItem>
                      <SelectItem value="competitive">Competitive pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Seasonal Adjustments</Label>
                    <p className="text-sm text-muted-foreground">AI learns seasonal preferences</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Client Style Learning</Label>
                    <p className="text-sm text-muted-foreground">Remember individual client preferences</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Automation Rules */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Automation Rules
                </CardTitle>
                <CardDescription>
                  Set up automated workflows and triggers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Task Creation</Label>
                    <p className="text-sm text-muted-foreground">Create tasks from new bookings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Auto-Responses</Label>
                    <p className="text-sm text-muted-foreground">Send immediate acknowledgments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inventory Reorder Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when supplies run low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performance Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Auto-generate performance reports</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Machine Learning Preferences */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Machine Learning & Data Usage
                </CardTitle>
                <CardDescription>
                  Control how your data is used for AI improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>AI Model Improvements</Label>
                        <p className="text-sm text-muted-foreground">Use anonymized data for AI training</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Personalization Learning</Label>
                        <p className="text-sm text-muted-foreground">Learn from your workflow patterns</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Industry Trend Analysis</Label>
                        <p className="text-sm text-muted-foreground">Participate in market research</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Usage Analytics</Label>
                        <p className="text-sm text-muted-foreground">Share anonymous usage statistics</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription & Billing Management */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Current Plan */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Current Subscription
                </CardTitle>
                <CardDescription>
                  Your current plan and usage details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Professional Plan</h3>
                    <p className="text-sm text-muted-foreground">$99/month</p>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Calls Used</span>
                    <span className="text-sm font-medium">2,450/5,000</span>
                  </div>
                  <Progress value={49} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm font-medium">2.3GB/10GB</span>
                  </div>
                  <Progress value={23} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Members</span>
                    <span className="text-sm font-medium">4/10</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Upgrade Plan</Button>
                  <Button variant="outline" size="sm">View Usage</Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Payment method and billing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing Email</Label>
                  <Input id="billingEmail" defaultValue="billing@bloomflourish.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Textarea id="billingAddress" rows={3} defaultValue="123 Garden Street&#10;Flower District&#10;Bloomington, FL 32801" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-renew</Label>
                    <p className="text-sm text-muted-foreground">Automatic monthly billing</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  Recent invoices and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">Invoice #INV-2024-04</p>
                        <p className="text-sm text-muted-foreground">April 1, 2024</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Paid</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">$99.00</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">Invoice #INV-2024-03</p>
                        <p className="text-sm text-muted-foreground">March 1, 2024</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Paid</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">$99.00</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">Invoice #INV-2024-02</p>
                        <p className="text-sm text-muted-foreground">February 1, 2024</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Paid</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">$99.00</span>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}