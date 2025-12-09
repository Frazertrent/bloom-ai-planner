import { useState, useEffect } from "react";
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
import { Flower2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  RefreshCw,
  Plus, Trash2, Edit3, Scissors, User, BarChart2, ChefHat
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "../hooks/useProfile";
interface CatalogItem {
  id: string;
  name: string;
  variety?: string;
  color?: string;
  base_price: number;
  unit?: string;
  category?: string;
  type: 'flower' | 'hardgood' | 'labor';
}
export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const { toast } = useToast();
  const { user } = useProfile();
  const { profile, organization, loading, error, updateProfile, updateOrganization } = useProfile();
  const [paymentData, setPaymentData] = useState({
    depositPercent: "50",
    paymentSchedule: "50-50",
    lateFee: 25,
    gracePeriod: 7
  });

  const [catalogDialogOpen, setCatalogDialogOpen] = useState<'flower' | 'hardgood' | 'labor' | null>(null);

  // Duplicate declaration removed
  const [taxData, setTaxData] = useState({
    laborTaxTreatment: "exempt",
    deliveryTaxTreatment: "taxable"
  });
  const [businessData, setBusinessData] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    tagline: "",     
    description: "",
    serviceRadius: 50,        
    deliveryFee: 25,         
    mileageRate: 0.75,
    address: {
      street: "",
      city: "",
      state: "",
      zip: ""
    }
  });
  const [pricingData, setPricingData] = useState({
    hourlyRate: 75,
    flowerMarkup: 35,
    hardGoodsMarkup: 25,
    rushFee: 150,
    setupFee: 100,
    depositPercent: 50,
    lateFee: 25,
    gracePeriod: 7,
    salesTax: 8.25
  });
  useEffect(() => {
    if (organization && organization.business_settings) {
      const businessSettings = organization.business_settings as Record<string, unknown> || {};
      
      setPaymentData({
        depositPercent: (businessSettings.depositPercent as string) || "50",
        paymentSchedule: (businessSettings.paymentSchedule as string) || "50-50",
        lateFee: (businessSettings.lateFee as number) || 25,
        gracePeriod: (businessSettings.gracePeriod as number) || 7
      });
      
      setStaffingData({
        leadDesignerRate: (businessSettings.leadDesignerRate as number) || 28,
        assistantRate: (businessSettings.assistantRate as number) || 18,
        setupCrewRate: (businessSettings.setupCrewRate as number) || 16,
        driverRate: (businessSettings.driverRate as number) || 15
      });
      
      setOperationsData({
        consultationDuration: (businessSettings.consultationDuration as string) || "90",
        proposalTurnaround: (businessSettings.proposalTurnaround as string) || "48",
        autoFollowUp: (businessSettings.autoFollowUp as boolean) !== undefined ? businessSettings.autoFollowUp as boolean : true,
        qualityControlChecklists: (businessSettings.qualityControlChecklists as boolean) !== undefined ? businessSettings.qualityControlChecklists as boolean : true,
        orderSchedule: (businessSettings.orderSchedule as string) || "tuesday-friday",
        leadTime: (businessSettings.leadTime as number) || 3,
        autoReorder: (businessSettings.autoReorder as boolean) !== undefined ? businessSettings.autoReorder as boolean : false,
        preferredSuppliers: (businessSettings.preferredSuppliers as string[]) || ["Wholesale Flowers Inc.", "Garden Fresh Supply", "Premium Blooms Co."]
      });
      setSecurityData({
        multiFactorAuth: (businessSettings.multiFactorAuth as boolean) !== undefined ? businessSettings.multiFactorAuth as boolean : true,
        sessionTimeout: (businessSettings.sessionTimeout as string) || "120",
        passwordPolicy: (businessSettings.passwordPolicy as string) || "strong",
        backupFrequency: (businessSettings.backupFrequency as string) || "daily",
        dataRetention: (businessSettings.dataRetention as string) || "7",
        gdprCompliance: (businessSettings.gdprCompliance as boolean) !== undefined ? businessSettings.gdprCompliance as boolean : true,
        dataExport: (businessSettings.dataExport as boolean) !== undefined ? businessSettings.dataExport as boolean : true,
        failedLoginAlerts: (businessSettings.failedLoginAlerts as boolean) !== undefined ? businessSettings.failedLoginAlerts as boolean : true,
        newDeviceNotifications: (businessSettings.newDeviceNotifications as boolean) !== undefined ? businessSettings.newDeviceNotifications as boolean : true,
        unusualActivityDetection: (businessSettings.unusualActivityDetection as boolean) !== undefined ? businessSettings.unusualActivityDetection as boolean : true,
        apiAccessMonitoring: (businessSettings.apiAccessMonitoring as boolean) !== undefined ? businessSettings.apiAccessMonitoring as boolean : false
      });
      setNotificationsData({
        newInquiries: (businessSettings.newInquiries as boolean) !== undefined ? businessSettings.newInquiries as boolean : true,
        paymentConfirmations: (businessSettings.paymentConfirmations as boolean) !== undefined ? businessSettings.paymentConfirmations as boolean : true,
        eventReminders: (businessSettings.eventReminders as boolean) !== undefined ? businessSettings.eventReminders as boolean : true,
        teamScheduleChanges: (businessSettings.teamScheduleChanges as boolean) !== undefined ? businessSettings.teamScheduleChanges as boolean : true,
        welcomeEmailTemplate: (businessSettings.welcomeEmailTemplate as string) || "professional",
        followUpSchedule: (businessSettings.followUpSchedule as string) || "24-48",
        smsNotifications: (businessSettings.smsNotifications as boolean) !== undefined ? businessSettings.smsNotifications as boolean : true,
        reviewRequests: (businessSettings.reviewRequests as boolean) !== undefined ? businessSettings.reviewRequests as boolean : true,
        autoPostEventPhotos: (businessSettings.autoPostEventPhotos as boolean) !== undefined ? businessSettings.autoPostEventPhotos as boolean : true,
        seasonalCampaigns: (businessSettings.seasonalCampaigns as boolean) !== undefined ? businessSettings.seasonalCampaigns as boolean : true,
        monthlyNewsletter: (businessSettings.monthlyNewsletter as boolean) !== undefined ? businessSettings.monthlyNewsletter as boolean : true,
        venueRelationshipUpdates: (businessSettings.venueRelationshipUpdates as boolean) !== undefined ? businessSettings.venueRelationshipUpdates as boolean : false
      });
      setAiData({
        designCreativityLevel: (businessSettings.designCreativityLevel as string) || "conservative",
        budgetEstimation: (businessSettings.budgetEstimation as string) || "balanced",
        seasonalAdjustments: (businessSettings.seasonalAdjustments as boolean) !== undefined ? businessSettings.seasonalAdjustments as boolean : true,
        clientStyleLearning: (businessSettings.clientStyleLearning as boolean) !== undefined ? businessSettings.clientStyleLearning as boolean : true,
        autoTaskCreation: (businessSettings.autoTaskCreation as boolean) !== undefined ? businessSettings.autoTaskCreation as boolean : true,
        emailAutoResponses: (businessSettings.emailAutoResponses as boolean) !== undefined ? businessSettings.emailAutoResponses as boolean : true,
        inventoryReorderAlerts: (businessSettings.inventoryReorderAlerts as boolean) !== undefined ? businessSettings.inventoryReorderAlerts as boolean : true,
        performanceMonitoring: (businessSettings.performanceMonitoring as boolean) !== undefined ? businessSettings.performanceMonitoring as boolean : false,
        aiModelImprovements: (businessSettings.aiModelImprovements as boolean) !== undefined ? businessSettings.aiModelImprovements as boolean : true,
        personalizationLearning: (businessSettings.personalizationLearning as boolean) !== undefined ? businessSettings.personalizationLearning as boolean : true,
        industryTrendAnalysis: (businessSettings.industryTrendAnalysis as boolean) !== undefined ? businessSettings.industryTrendAnalysis as boolean : false,
        usageAnalytics: (businessSettings.usageAnalytics as boolean) !== undefined ? businessSettings.usageAnalytics as boolean : false
      });
      setBillingData({
        currentPlan: (businessSettings.currentPlan as string) || "professional",
        planPrice: (businessSettings.planPrice as number) || 99,
        billingEmail: (businessSettings.billingEmail as string) || "billing@bloomflourish.com",
        billingAddress: (businessSettings.billingAddress as string) || "123 Garden Street Flower District Bloomington, FL 32801",
        paymentMethod: (businessSettings.paymentMethod as string) || "**** **** **** 4242",
        cardExpiry: (businessSettings.cardExpiry as string) || "12/25"
      });
    }
  }, [organization]);
  
  useEffect(() => {
  if (organization) {
    fetchCatalogData();
    fetchRecipeData();
  }
}, [organization]);
  


  useEffect(() => {
    if (organization) {
      const businessSettings = organization.business_settings && 
                               typeof organization.business_settings === 'object' && 
                               organization.business_settings !== null ? 
                               organization.business_settings as { 
                                 laborTaxTreatment?: string; 
                                 deliveryTaxTreatment?: string; 
                                 hourlyRate?: number; 
                                 flowerMarkup?: number; 
                                 hardGoodsMarkup?: number; 
                                 rushFee?: number; 
                                 setupFee?: number; 
                                 depositPercent?: number; 
                                 lateFee?: number; 
                                 gracePeriod?: number; 
                                 salesTax?: number; 
                                 tagline?: string; 
                                 description?: string; 
                                 serviceRadius?: number; 
                                 deliveryFee?: number; 
                                 mileageRate?: number;
                                 premiumServiceAreas?: string[];  // ADD THIS LINE
                               } : {};
      setTaxData({
        laborTaxTreatment: businessSettings.laborTaxTreatment || "exempt",
        deliveryTaxTreatment: businessSettings.deliveryTaxTreatment || "taxable"
      });
    }
  }, [organization]);
  useEffect(() => {
    if (organization) {
      const businessSettings = organization.business_settings && 
                               typeof organization.business_settings === 'object' && 
                               organization.business_settings !== null ? 
                               organization.business_settings as { laborTaxTreatment?: string; deliveryTaxTreatment?: string } : {};
      
      setTaxData({
        laborTaxTreatment: businessSettings.laborTaxTreatment || "exempt",
        deliveryTaxTreatment: businessSettings.deliveryTaxTreatment || "taxable"
      });
    }
  }, [organization]);
  useEffect(() => {
    if (organization) {
      const businessSettings = organization.business_settings && 
                               typeof organization.business_settings === 'object' && 
                               organization.business_settings !== null ? 
                               organization.business_settings as { hourlyRate?: number; flowerMarkup?: number; hardGoodsMarkup?: number; rushFee?: number; setupFee?: number; depositPercent?: number; lateFee?: number; gracePeriod?: number; salesTax?: number } : {};
      
      setPricingData({
        hourlyRate: businessSettings.hourlyRate || 75,
        flowerMarkup: businessSettings.flowerMarkup || 35,
        hardGoodsMarkup: businessSettings.hardGoodsMarkup || 25,
        rushFee: businessSettings.rushFee || 150,
        setupFee: businessSettings.setupFee || 100,
        depositPercent: businessSettings.depositPercent || 50,
        lateFee: businessSettings.lateFee || 25,
        gracePeriod: businessSettings.gracePeriod || 7,
        salesTax: businessSettings.salesTax || 8.25
      });
    }
  }, [organization]);
  useEffect(() => {
    if (organization) {
      // Safely handle address
      const address = organization.address && 
                     typeof organization.address === 'object' && 
                     organization.address !== null ? 
                     organization.address as { street?: string; city?: string; state?: string; zip?: string } : {};
  
      // Safely handle business_settings
      const businessSettings = organization.business_settings && 
                               typeof organization.business_settings === 'object' && 
                               organization.business_settings !== null ? 
                               organization.business_settings as { tagline?: string; description?: string; serviceRadius?: number; deliveryFee?: number; mileageRate?: number; premiumServiceAreas?: string[] } : {};
  
                               setPremiumServiceAreas(
                                (businessSettings.premiumServiceAreas as string[]) || [
                                  "Downtown District",
                                  "Luxury Resort Area", 
                                  "Historic Wedding Venues"
                                ]
                              );
                               
      setBusinessData({
        name: organization.name || "",
        phone: organization.phone || "",
        email: organization.email || "",
        website: organization.website || "",
        tagline: businessSettings.tagline || "",
        description: businessSettings.description || "",
        serviceRadius: businessSettings.serviceRadius || 50,        
        deliveryFee: businessSettings.deliveryFee || 25,           
        mileageRate: businessSettings.mileageRate || 0.75,
        address: {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          zip: address.zip || ""
        }
      });
    }
  }, [organization]);
  const addSupplier = () => {
    const supplierName = prompt("Enter supplier name:");
    if (supplierName && supplierName.trim()) {
      setOperationsData(prev => ({
        ...prev,
        preferredSuppliers: [...prev.preferredSuppliers, supplierName.trim()]
      }));
    }
  };
  
  const [catalogData, setCatalogData] = useState({
    flowers: [] as { id: string; name: string; variety?: string; color: string; base_price: number; unit: string; bulk_pricing: { quantity: number; price: number }[]; is_year_round: boolean; preferred_vendor?: string; color_hex: string; notes?: string; seasonal_months?: string }[],
    hardGoods: [] as { id: string; name: string; category: string; purchase_price: number; rental_price: number; unit: string; size_dimensions?: string; preferred_vendor?: string; notes?: string }[],
    laborRates: [] as { id: string; name: string; category: string; hourly_rate: number; minimum_hours: number; default_for_category: boolean; description: string }[]
  });

const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  
const [editingCatalogItem, setEditingCatalogItem] = useState<{
  id?: string;
  name?: string;
  variety?: string;
  color?: string;
  base_price?: number;
  unit?: string;
  is_year_round?: boolean;
  preferred_vendor?: string;
  color_hex?: string;
  notes?: string;
  category?: string;
  purchase_price?: number;
  rental_price?: number;
  size_dimensions?: string;
  hourly_rate?: number;
  minimum_hours?: number;
  default_for_category?: boolean;
  description?: string;
  seasonal_months?: string;
} | null>(null);

  const addPremiumServiceArea = () => {
    const areaName = prompt("Enter premium service area name:");
    if (areaName && areaName.trim()) {
      setPremiumServiceAreas(prev => [...prev, areaName.trim()]);
    }
  };
  
  const removePremiumServiceArea = (areaToRemove: string) => {
    setPremiumServiceAreas(prev => prev.filter(area => area !== areaToRemove));
  };

  const removeSupplier = (supplierToRemove: string) => {
    setOperationsData(prev => ({
      ...prev,
      preferredSuppliers: prev.preferredSuppliers.filter(supplier => supplier !== supplierToRemove)
    }));
  };
  const handleSave = async () => {
    setSaveStatus("saving");
    
    try {
      const result = await updateOrganization({
        name: businessData.name,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
        address: businessData.address,
        business_settings: {
          // Business Data
          tagline: businessData.tagline,
          description: businessData.description,
          serviceRadius: businessData.serviceRadius,
          deliveryFee: businessData.deliveryFee,
          mileageRate: businessData.mileageRate,
          premiumServiceAreas: premiumServiceAreas,
          
          // Pricing Data
          hourlyRate: pricingData.hourlyRate,
          flowerMarkup: pricingData.flowerMarkup,
          hardGoodsMarkup: pricingData.hardGoodsMarkup,
          rushFee: pricingData.rushFee,
          setupFee: pricingData.setupFee,
          salesTax: pricingData.salesTax,
          
          // Payment Data - FIXED: No duplicates, correct sources
          depositPercent: paymentData.depositPercent,
          paymentSchedule: paymentData.paymentSchedule,
          lateFee: paymentData.lateFee,
          gracePeriod: paymentData.gracePeriod,
          
          // Tax Data
          laborTaxTreatment: taxData.laborTaxTreatment,
          deliveryTaxTreatment: taxData.deliveryTaxTreatment,
          
          // Operations Data
          consultationDuration: operationsData.consultationDuration,
          proposalTurnaround: operationsData.proposalTurnaround,
          autoFollowUp: operationsData.autoFollowUp,
          qualityControlChecklists: operationsData.qualityControlChecklists,
          orderSchedule: operationsData.orderSchedule,
          leadTime: operationsData.leadTime,
          autoReorder: operationsData.autoReorder,
          preferredSuppliers: operationsData.preferredSuppliers,
          
          // Staffing Data
          leadDesignerRate: staffingData.leadDesignerRate,
          assistantRate: staffingData.assistantRate,
          setupCrewRate: staffingData.setupCrewRate,
          driverRate: staffingData.driverRate,
          
          // Security Data
          multiFactorAuth: securityData.multiFactorAuth,
          sessionTimeout: securityData.sessionTimeout,
          passwordPolicy: securityData.passwordPolicy,
          backupFrequency: securityData.backupFrequency,
          dataRetention: securityData.dataRetention,
          gdprCompliance: securityData.gdprCompliance,
          dataExport: securityData.dataExport,
          failedLoginAlerts: securityData.failedLoginAlerts,
          newDeviceNotifications: securityData.newDeviceNotifications,
          unusualActivityDetection: securityData.unusualActivityDetection,
          apiAccessMonitoring: securityData.apiAccessMonitoring,
          
          // Notifications Data
          newInquiries: notificationsData.newInquiries,
          paymentConfirmations: notificationsData.paymentConfirmations,
          eventReminders: notificationsData.eventReminders,
          teamScheduleChanges: notificationsData.teamScheduleChanges,
          welcomeEmailTemplate: notificationsData.welcomeEmailTemplate,
          followUpSchedule: notificationsData.followUpSchedule,
          smsNotifications: notificationsData.smsNotifications,
          reviewRequests: notificationsData.reviewRequests,
          autoPostEventPhotos: notificationsData.autoPostEventPhotos,
          seasonalCampaigns: notificationsData.seasonalCampaigns,
          monthlyNewsletter: notificationsData.monthlyNewsletter,
          venueRelationshipUpdates: notificationsData.venueRelationshipUpdates,
          
          // AI Data
          designCreativityLevel: aiData.designCreativityLevel,
          budgetEstimation: aiData.budgetEstimation,
          seasonalAdjustments: aiData.seasonalAdjustments,
          clientStyleLearning: aiData.clientStyleLearning,
          autoTaskCreation: aiData.autoTaskCreation,
          emailAutoResponses: aiData.emailAutoResponses,
          inventoryReorderAlerts: aiData.inventoryReorderAlerts,
          performanceMonitoring: aiData.performanceMonitoring,
          aiModelImprovements: aiData.aiModelImprovements,
          personalizationLearning: aiData.personalizationLearning,
          industryTrendAnalysis: aiData.industryTrendAnalysis,
          usageAnalytics: aiData.usageAnalytics,
          
          // Billing Data
          currentPlan: billingData.currentPlan,
          planPrice: billingData.planPrice,
          billingEmail: billingData.billingEmail,
          billingAddress: billingData.billingAddress,
          paymentMethod: billingData.paymentMethod,
          cardExpiry: billingData.cardExpiry,
        }
      });
      
      if (result.success) {
        setSaveStatus("saved");
        toast({
          title: "Settings Saved",
          description: "Your business information has been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err) {
      toast({
        title: "Save Failed", 
        description: err.message,
        variant: "destructive"
      });
      setSaveStatus("idle");
      return;
    }
    
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

const fetchCatalogData = async () => {
  if (!organization) return;
  
  try {
    const [flowersRes, hardGoodsRes, laborRes] = await Promise.all([
      supabase
        .from('flower_catalog')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name'),
      supabase
        .from('hard_goods_catalog')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name'),
      supabase
        .from('labor_rates_catalog')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name')
    ]);
console.log('Flowers:', flowersRes.data); // ADD THIS
    console.log('Hard goods:', hardGoodsRes.data); // ADD THIS
    console.log('Labor:', laborRes.data); // ADD THIS
    setCatalogData({
      flowers: (flowersRes.data || []) as any,
      hardGoods: (hardGoodsRes.data || []) as any,
      laborRates: (laborRes.data || []) as any
    });

const allItems: CatalogItem[] = [
  ...(flowersRes.data || []).map((f: { id: string; name: string; variety?: string; color?: string; base_price: number; unit: string }) => ({
    id: f.id,
    name: `${f.name}${f.variety ? ' - ' + f.variety : ''}${f.color ? ' - ' + f.color : ''}`,
    base_price: f.base_price,
    unit: f.unit,
    type: 'flower' as const
  })),
  ...(hardGoodsRes.data || []).map((h: { id: string; name: string; purchase_price?: number; rental_price?: number; unit: string }) => ({
    id: h.id,
    name: h.name,
    base_price: h.purchase_price || h.rental_price,
    unit: h.unit,
    type: 'hardgood' as const
  })),
  ...(laborRes.data || []).map((l: { id: string; name: string; category: string; hourly_rate: number; minimum_hours: number; default_for_category: boolean; description: string }) => ({
    id: l.id,
    name: l.name,
    base_price: l.hourly_rate,
    unit: 'hour',
    type: 'labor' as const
  }))
];

setCatalogItems(allItems);
    
  } catch (error) {
    console.error('Error fetching catalog:', error);
  }
};

const openNewFlowerDialog = () => {
  setEditingCatalogItem({
    name: '',
    variety: '',
    color: '',
    base_price: 0,
    unit: 'stem',
    is_year_round: true,
    preferred_vendor: '',
    color_hex: '#FFFFFF',
    notes: ''
  });
  setCatalogDialogOpen('flower');
};

const openNewHardGoodDialog = () => {
  setEditingCatalogItem({
    name: '',
    category: 'vase',
    purchase_price: 0,
    rental_price: 0,
    unit: 'each',
    size_dimensions: '',
    preferred_vendor: '',
    notes: ''
  });
  setCatalogDialogOpen('hardgood');
};

const openNewLaborDialog = () => {
  setEditingCatalogItem({
    name: '',
    category: 'design',
    hourly_rate: 0,
    minimum_hours: 1.0,
    default_for_category: false,
    description: ''
  });
  setCatalogDialogOpen('labor');
};



const openEditFlowerDialog = (flower: { 
  id: string; 
  name: string; 
  variety?: string; 
  color: string; 
  base_price: number; 
  unit: string; 
  is_year_round: boolean; 
  seasonal_months?: string;
  preferred_vendor?: string; 
  color_hex: string; 
  notes?: string; 
}) => {
  setEditingCatalogItem({
    id: flower.id,
    name: flower.name,
    variety: flower.variety,
    color: flower.color,
    base_price: flower.base_price,
    unit: flower.unit,
    is_year_round: flower.is_year_round,
    seasonal_months: flower.seasonal_months,
    preferred_vendor: flower.preferred_vendor,
    color_hex: flower.color_hex,
    notes: flower.notes
  });
  setCatalogDialogOpen('flower');
};

const openEditHardGoodDialog = (item: { 
  id: string; 
  name: string; 
  category: string; 
  purchase_price: number; 
  rental_price: number; 
  unit: string; 
  size_dimensions?: string; 
  preferred_vendor?: string; 
  notes?: string; 
}) => {
  setEditingCatalogItem({
    id: item.id,
    name: item.name,
    category: item.category,
    purchase_price: item.purchase_price,
    rental_price: item.rental_price,
    unit: item.unit,
    size_dimensions: item.size_dimensions,
    preferred_vendor: item.preferred_vendor,
    notes: item.notes
  });
  setCatalogDialogOpen('hardgood');
};

const openEditLaborDialog = (rate: { 
  id: string; 
  name: string; 
  category: string; 
  hourly_rate: number; 
  minimum_hours: number; 
  default_for_category: boolean; 
  description: string; 
}) => {
  setEditingCatalogItem({
    id: rate.id,
    name: rate.name,
    category: rate.category,
    hourly_rate: rate.hourly_rate,
    minimum_hours: rate.minimum_hours,
    default_for_category: rate.default_for_category,
    description: rate.description
  });
  setCatalogDialogOpen('labor');
};

const saveCatalogItem = async () => {
  if (!organization) return;

  try {
    const isEditing = !!editingCatalogItem?.id;

    if (catalogDialogOpen === 'flower') {
      if (isEditing) {
        const { error } = await supabase
          .from('flower_catalog')
          .update({
            name: editingCatalogItem.name,
            variety: editingCatalogItem.variety,
            color: editingCatalogItem.color,
            base_price: editingCatalogItem.base_price,
            unit: editingCatalogItem.unit,
            is_year_round: editingCatalogItem.is_year_round,
            seasonal_months: editingCatalogItem.seasonal_months,
            preferred_vendor: editingCatalogItem.preferred_vendor,
            color_hex: editingCatalogItem.color_hex,
            notes: editingCatalogItem.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCatalogItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('flower_catalog')
          .insert({
            organization_id: organization.id,
            ...editingCatalogItem
          } as any);

        if (error) throw error;
      }
    } else if (catalogDialogOpen === 'hardgood') {
      if (isEditing) {
        const { error } = await supabase
          .from('hard_goods_catalog')
          .update({
            name: editingCatalogItem.name,
            category: editingCatalogItem.category,
            purchase_price: editingCatalogItem.purchase_price,
            rental_price: editingCatalogItem.rental_price,
            unit: editingCatalogItem.unit,
            size_dimensions: editingCatalogItem.size_dimensions,
            preferred_vendor: editingCatalogItem.preferred_vendor,
            notes: editingCatalogItem.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCatalogItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hard_goods_catalog')
          .insert({
            organization_id: organization.id,
            ...editingCatalogItem
          } as any);

        if (error) throw error;
      }
    } else if (catalogDialogOpen === 'labor') {
      if (isEditing) {
        const { error } = await supabase
          .from('labor_rates_catalog')
          .update({
            name: editingCatalogItem.name,
            category: editingCatalogItem.category,
            hourly_rate: editingCatalogItem.hourly_rate,
            minimum_hours: editingCatalogItem.minimum_hours,
            default_for_category: editingCatalogItem.default_for_category,
            description: editingCatalogItem.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCatalogItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('labor_rates_catalog')
          .insert({
            organization_id: organization.id,
            ...editingCatalogItem
          } as any);

        if (error) throw error;
      }
    }

    await fetchCatalogData();
    setCatalogDialogOpen(null);
    setEditingCatalogItem(null);

    toast({
      title: 'Success',
      description: isEditing ? 'Item updated in catalog' : 'Item added to catalog'
    });
  } catch (error) {
    console.error('Error saving catalog item:', error);
    toast({
      title: 'Error',
      description: 'Failed to save catalog item',
      variant: 'destructive'
    });
  }
};

const fetchRecipeData = async () => {
  if (!organization) return;
  
  try {
    const { data: recipes, error } = await supabase
      .from('recipe_templates')
      .select(`
        *,
        recipe_ingredients (
          id,
          catalog_item_id,
          catalog_item_type,
          quantity
        )
      `)
      .eq('organization_id', organization.id)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Enrich ingredients with names from catalog
    const enrichedRecipes = await Promise.all(
      (recipes || []).map(async (recipe) => {
        const enrichedIngredients = await Promise.all(
          (recipe.recipe_ingredients || []).map(async (ing) => {
            let itemName = 'Unknown Item';
            
            if (ing.catalog_item_type === 'flower') {
              const { data } = await supabase
                .from('flower_catalog')
                .select('name, variety, color')
                .eq('id', ing.catalog_item_id)
                .single();
              if (data) itemName = `${data.name}${data.variety ? ' - ' + data.variety : ''}${data.color ? ' - ' + data.color : ''}`;
            } else if (ing.catalog_item_type === 'hardgood') {
              const { data } = await supabase
                .from('hard_goods_catalog')
                .select('name')
                .eq('id', ing.catalog_item_id)
                .single();
              if (data) itemName = data.name;
            } else if (ing.catalog_item_type === 'labor') {
              const { data } = await supabase
                .from('labor_rates_catalog')
                .select('name')
                .eq('id', ing.catalog_item_id)
                .single();
              if (data) itemName = data.name;
            }

            return { ...ing, item_name: itemName };
          })
        );

        return {
          ...recipe,
          ingredients: enrichedIngredients
        };
      })
    );

    setRecipeData(enrichedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
};

const deleteCatalogItem = async (type: 'flower' | 'hardgood' | 'labor', id: string) => {
  try {
    const table = type === 'flower' ? 'flower_catalog' : 
                  type === 'hardgood' ? 'hard_goods_catalog' : 
                  'labor_rates_catalog';

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;

    await fetchCatalogData();

    toast({
      title: 'Success',
      description: 'Item removed from catalog'
    });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove item',
      variant: 'destructive'
    });
  }
};

const [recipeData, setRecipeData] = useState<{
  id: string;
  name: string;
  category: string;
  description?: string;
  estimated_labor_hours: number;
  estimated_cost: number;
  typical_client_price: number;
  notes?: string;
  ingredients?: Array<{
    id: string;
    catalog_item_id: string;
    catalog_item_type: string;
    quantity: number;
    item_name?: string;
  }>;
}[]>([]);

const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
const [editingRecipe, setEditingRecipe] = useState<{
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  estimated_labor_hours?: number;
  estimated_cost?: number;
  typical_client_price?: number;
  notes?: string;
  ingredients?: Array<{
    catalog_item_id: string;
    catalog_item_type: string;
    quantity: number;
  }>;
} | null>(null);

// Removed duplicate declaration of integrationsData and setIntegrationsData
// Removed duplicate declaration of handleIntegrationAction
  const [staffingData, setStaffingData] = useState({
    leadDesignerRate: 28,
    assistantRate: 18,
    setupCrewRate: 16,
    driverRate: 15
  });

  const [premiumServiceAreas, setPremiumServiceAreas] = useState<string[]>([
    "Downtown District",
    "Luxury Resort Area", 
    "Historic Wedding Venues"
  ]);

  const [operationsData, setOperationsData] = useState({
    consultationDuration: "90",
    proposalTurnaround: "48",
    autoFollowUp: true,
    qualityControlChecklists: true,
    orderSchedule: "tuesday-friday",
    leadTime: 3,
    autoReorder: false,
    preferredSuppliers: ["Wholesale Flowers Inc.", "Garden Fresh Supply", "Premium Blooms Co."]
  });
  const [securityData, setSecurityData] = useState({
    multiFactorAuth: true,
    sessionTimeout: "120",
    passwordPolicy: "strong",
    backupFrequency: "daily",
    dataRetention: "7",
    gdprCompliance: true,
    dataExport: true,
    failedLoginAlerts: true,
    newDeviceNotifications: true,
    unusualActivityDetection: true,
    apiAccessMonitoring: false
  });
  const [notificationsData, setNotificationsData] = useState({
    newInquiries: true,
    paymentConfirmations: true,
    eventReminders: true,
    teamScheduleChanges: true,
    welcomeEmailTemplate: "professional",
    followUpSchedule: "24-48",
    smsNotifications: true,
    reviewRequests: true,
    autoPostEventPhotos: true,
    seasonalCampaigns: true,
    monthlyNewsletter: true,
    venueRelationshipUpdates: false
  });
  const [aiData, setAiData] = useState({
    designCreativityLevel: "conservative",
    budgetEstimation: "balanced",
    seasonalAdjustments: true,
    clientStyleLearning: true,
    autoTaskCreation: true,
    emailAutoResponses: true,
    inventoryReorderAlerts: true,
    performanceMonitoring: false,
    aiModelImprovements: true,
    personalizationLearning: true,
    industryTrendAnalysis: false,
    usageAnalytics: false
  });
  const [billingData, setBillingData] = useState({
    currentPlan: "professional",
    planPrice: 99,
    billingEmail: "billing@bloomflourish.com",
    billingAddress: "123 Garden Street Flower District Bloomington, FL 32801",
    paymentMethod: "**** **** **** 4242",
    cardExpiry: "12/25"
  });
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
    
    <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
      <h3 className="font-bold">Debug Info (remove after testing):</h3>
      <p>User: {user ? '✅ Logged in' : '❌ Not logged in'} ({user?.email})</p>
      <p>Profile: {loading ? '⏳ Loading...' : profile ? '✅ Found' : '❌ Not found'}</p>
      <p>Organization: {organization ? `✅ ${organization.name}` : '❌ Not found'}</p>
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
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
                    <TabsTrigger value="catalog" className="flex items-center gap-1 text-xs">
  <Package className="w-3 h-3" />
  <span className="hidden sm:inline">Catalog</span>
</TabsTrigger>
<TabsTrigger value="recipes" className="flex items-center gap-1 text-xs">
  <ChefHat className="w-3 h-3" />
  <span className="hidden sm:inline">Recipes</span>
</TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1 text-xs">
            <Settings2 className="w-3 h-3" />
            <span className="hidden sm:inline">Operations</span>
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
                  <Input 
                    id="businessName" 
                    value={businessData.name}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalEntity">Legal Entity</Label>
                  <Input 
                    id="legalEntity" 
                    value={businessData.name ? `${businessData.name} LLC` : ""}
                    onChange={(e) => {
                      // This field is auto-generated from business name
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    rows={3} 
                    value={`${businessData.address.street}\n${businessData.address.city}, ${businessData.address.state} ${businessData.address.zip}`}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      const addressLine = lines[1] || '';
                      const [city, stateZip] = addressLine.split(', ');
                      const [state, zip] = (stateZip || '').split(' ');
                      setBusinessData(prev => ({ 
                        ...prev, 
                        address: { 
                          street: lines[0] || '', 
                          city: city || '', 
                          state: state || '', 
                          zip: zip || '' 
                        }
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex">
                      <Phone className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={businessData.phone}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex">
                      <Mail className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={businessData.email}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex">
                    <Globe className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                    <Input 
                      id="website" 
                      value={businessData.website}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                    />
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
  <Input 
    id="tagline" 
    value={businessData.tagline || ""}
    onChange={(e) => setBusinessData(prev => ({ ...prev, tagline: e.target.value }))}
  />
</div>
<div className="space-y-2">
  <Label htmlFor="description">Business Description</Label>
  <Textarea 
    id="description" 
    rows={3} 
    value={businessData.description || ""}
    onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
  />
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
    <Input 
      id="serviceRadius" 
      type="number" 
      value={businessData.serviceRadius}
      onChange={(e) => setBusinessData(prev => ({ ...prev, serviceRadius: parseInt(e.target.value) || 0 }))}
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="deliveryFee">Base Delivery Fee</Label>
    <Input 
      id="deliveryFee" 
      value={businessData.deliveryFee}
      onChange={(e) => setBusinessData(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value.replace('$', '')) || 0 }))}
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="mileageRate">Per Mile Rate</Label>
    <Input 
      id="mileageRate" 
      value={businessData.mileageRate}
      onChange={(e) => setBusinessData(prev => ({ ...prev, mileageRate: parseFloat(e.target.value.replace('$', '')) || 0 }))}
    />
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
                    <Input 
  id="hourlyRate" 
  value={pricingData.hourlyRate}
  onChange={(e) => setPricingData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
/>
                    <span className="text-muted-foreground mt-2 ml-2">/hour</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flowerMarkup">Flower Markup</Label>
                    <div className="flex">
                    <Input 
  id="flowerMarkup" 
  value={pricingData.flowerMarkup}
  onChange={(e) => setPricingData(prev => ({ ...prev, flowerMarkup: parseFloat(e.target.value) || 0 }))}
/>
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hardGoodsMarkup">Hard Goods Markup</Label>
                    <div className="flex">
                    <Input 
  id="hardGoodsMarkup" 
  value={pricingData.hardGoodsMarkup}
  onChange={(e) => setPricingData(prev => ({ ...prev, hardGoodsMarkup: parseFloat(e.target.value) || 0 }))}
/>
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rushFee">Rush Order Fee</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
  id="rushFee" 
  value={pricingData.rushFee}
  onChange={(e) => setPricingData(prev => ({ ...prev, rushFee: parseFloat(e.target.value) || 0 }))}
/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupFee">Setup Fee</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
  id="setupFee" 
  value={pricingData.setupFee}
  onChange={(e) => setPricingData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 0 }))}
/>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


  <Flower2 className="w-3 h-3" />
  <span className="hidden sm:inline">Catalog</span>

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
                  <Select 
  value={paymentData.depositPercent} 
  onValueChange={(value) => setPaymentData(prev => ({ ...prev, depositPercent: value }))}
>
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
                  <Select 
  value={paymentData.paymentSchedule} 
  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentSchedule: value }))}
>
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
                    <Input 
  id="lateFee" 
  value={paymentData.lateFee}
  onChange={(e) => setPaymentData(prev => ({ ...prev, lateFee: parseFloat(e.target.value) || 0 }))}
/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input 
  id="gracePeriod" 
  type="number" 
  value={paymentData.gracePeriod}
  onChange={(e) => setPaymentData(prev => ({ ...prev, gracePeriod: parseInt(e.target.value) || 0 }))}
/>
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
                    <Input 
  id="salesTax" 
  value={pricingData.salesTax}
  onChange={(e) => setPricingData(prev => ({ ...prev, salesTax: parseFloat(e.target.value) || 0 }))}
/>
                      <span className="text-muted-foreground mt-2 ml-2">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="laborTax">Labor Tax Treatment</Label>
<Select 
  value={taxData.laborTaxTreatment}
  onValueChange={(value) => setTaxData(prev => ({ ...prev, laborTaxTreatment: value }))}
>
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
                    <Select 
                      value={taxData.deliveryTaxTreatment}
                      onValueChange={(value) => setTaxData(prev => ({ ...prev, deliveryTaxTreatment: value }))}
                    >
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

        <TabsContent value="catalog" className="space-y-6">
  <div className="grid gap-6">
    {/* Flowers Catalog */}
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-primary" />
              Flower Catalog
            </CardTitle>
            <CardDescription>
              Master library with pricing, bulk tiers, and seasonal availability
            </CardDescription>
          </div>
          <Button size="sm" onClick={openNewFlowerDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Flower
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {catalogData.flowers.map((flower) => (
            <div key={flower.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: flower.color_hex }}
                />
                <div>
                  <p className="font-medium">{flower.name} {flower.variety && `- ${flower.variety}`}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{flower.color}</span>
                    <span className="text-sm font-semibold text-primary">${flower.base_price?.toFixed(2)}/{flower.unit}</span>
                    
                    {flower.is_year_round ? (
  <Badge variant="outline" className="text-xs">Year-round</Badge>
) : (
  <Badge variant="outline" className="text-xs">
    {flower.seasonal_months || 'Seasonal'}
  </Badge>
)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => openEditFlowerDialog(flower)}
  >
    <Edit3 className="w-4 h-4" />
  </Button>
  <div className="flex gap-2">
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => openEditFlowerDialog(flower)}
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
</div>
            </div>
          ))}
          {catalogData.flowers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No flowers in catalog yet. Add your first flower to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Hard Goods Catalog */}
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Hard Goods Catalog
            </CardTitle>
            <CardDescription>
              Vases, foam, wire, ribbon, containers, and supplies
            </CardDescription>
          </div>
          <Button size="sm" onClick={openNewHardGoodDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Hard Good
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {catalogData.hardGoods.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  {item.purchase_price && (
                    <span className="text-sm text-muted-foreground">
                      Purchase: ${item.purchase_price.toFixed(2)}
                    </span>
                  )}
                  {item.rental_price && (
                    <span className="text-sm text-muted-foreground">
                      Rental: ${item.rental_price.toFixed(2)}
                    </span>
                  )}
                  {item.size_dimensions && (
                    <span className="text-xs text-muted-foreground">({item.size_dimensions})</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => openEditHardGoodDialog(item)}
  >
    <Edit3 className="w-4 h-4" />
  </Button>
  <div className="flex gap-2">
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => openEditHardGoodDialog(item)}
  >

    <Trash2 className="w-4 h-4" />
  </Button>
</div>
</div>
            </div>
          ))}
          {catalogData.hardGoods.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hard goods in catalog yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Labor Rates Catalog */}
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Labor Rates
            </CardTitle>
            <CardDescription>
              Hourly rates for services
            </CardDescription>
          </div>
          <Button size="sm" onClick={openNewLaborDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Labor Rate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {catalogData.laborRates.map((rate) => (
            <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium">{rate.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{rate.category}</Badge>
                  <span className="text-sm font-semibold text-primary">
                    ${rate.hourly_rate?.toFixed(2)}/hour
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Min: {rate.minimum_hours}hrs
                  </span>
                  {rate.default_for_category && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
  <div className="flex gap-2">
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => openEditLaborDialog(rate)}
  >
    <Edit3 className="w-4 h-4" />
  </Button>
  <Button 
    size="sm" 
    variant="ghost"
    onClick={() => deleteCatalogItem('labor', rate.id)}
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
</div>
            </div>
          ))}
          {catalogData.laborRates.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No labor rates in catalog yet.
            </p>
          )}
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
  <Select 
    value={operationsData.consultationDuration}
    onValueChange={(value) => setOperationsData(prev => ({ ...prev, consultationDuration: value }))}
  >
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
                  <Select 
  value={operationsData.proposalTurnaround}
  onValueChange={(value) => setOperationsData(prev => ({ ...prev, proposalTurnaround: value }))}
>
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
  <Switch 
    checked={operationsData.autoFollowUp}
    onCheckedChange={(checked) => setOperationsData(prev => ({ ...prev, autoFollowUp: checked }))}
  />
                </div>
                <div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Quality Control Checklists</Label>
    <p className="text-sm text-muted-foreground">Require completion before events</p>
  </div>
  <Switch 
    checked={operationsData.qualityControlChecklists}
    onCheckedChange={(checked) => setOperationsData(prev => ({ ...prev, qualityControlChecklists: checked }))}
  />
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
    {operationsData.preferredSuppliers.map((supplier, index) => (
      <Badge 
        key={index} 
        variant="secondary" 
        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => removeSupplier(supplier)}
      >
        {supplier} ×
      </Badge>
    ))}
    <Button variant="outline" size="sm" onClick={addSupplier}>
      Add Supplier
    </Button>
  </div>
</div>
                <div className="space-y-2">
                  <Label htmlFor="orderSchedule">Standard Order Schedule</Label>
                  <Select 
  value={operationsData.orderSchedule}
  onValueChange={(value) => setOperationsData(prev => ({ ...prev, orderSchedule: value }))}
>
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
                  <Input 
  id="leadTime" 
  type="number" 
  value={operationsData.leadTime}
  onChange={(e) => setOperationsData(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 0 }))}
/>
                </div>
                <div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Auto Reorder</Label>
    <p className="text-sm text-muted-foreground">Automatically reorder based on inventory levels</p>
  </div>
  <Switch 
    checked={operationsData.autoReorder}
    onCheckedChange={(checked) => setOperationsData(prev => ({ ...prev, autoReorder: checked }))}
  />
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
                      <Input 
  id="designerRate" 
  value={staffingData.leadDesignerRate} 
  onChange={(e) => setStaffingData({...staffingData, leadDesignerRate: parseFloat(e.target.value) || 0})}
/>
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assistantRate">Assistant Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
  id="assistantRate" 
  value={staffingData.assistantRate} 
  onChange={(e) => setStaffingData({...staffingData, assistantRate: parseFloat(e.target.value) || 0})}
/>
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupRate">Setup Crew Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
  id="setupRate" 
  value={staffingData.setupCrewRate} 
  onChange={(e) => setStaffingData({...staffingData, setupCrewRate: parseFloat(e.target.value) || 0})}
/>
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverRate">Driver Rate</Label>
                    <div className="flex">
                      <DollarSign className="w-4 h-4 mt-3 mr-2 text-muted-foreground" />
                      <Input 
  id="driverRate" 
  value={staffingData.driverRate} 
  onChange={(e) => setStaffingData({...staffingData, driverRate: parseFloat(e.target.value) || 0})}
/>
                      <span className="text-muted-foreground mt-2 ml-2">/hr</span>
                    </div>
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
  <Switch 
    checked={securityData.multiFactorAuth} 
    onCheckedChange={(checked) => setSecurityData({...securityData, multiFactorAuth: checked})}
  />
</div>
<div className="space-y-2">
  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
  <Select 
    value={securityData.sessionTimeout} 
    onValueChange={(value) => setSecurityData({...securityData, sessionTimeout: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="30">30 minutes</SelectItem>
      <SelectItem value="60">1 hour</SelectItem>
      <SelectItem value="120">2 hours</SelectItem>
      <SelectItem value="240">4 hours</SelectItem>
      <SelectItem value="480">8 hours</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="space-y-2">
  <Label htmlFor="passwordPolicy">Password Policy</Label>
  <Select 
    value={securityData.passwordPolicy} 
    onValueChange={(value) => setSecurityData({...securityData, passwordPolicy: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="basic">Basic (8+ chars)</SelectItem>
      <SelectItem value="strong">Strong (12+ chars, mixed case, numbers)</SelectItem>
      <SelectItem value="enterprise">Enterprise (16+ chars, symbols)</SelectItem>
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
  <Select 
    value={securityData.backupFrequency} 
    onValueChange={(value) => setSecurityData({...securityData, backupFrequency: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="hourly">Every hour</SelectItem>
      <SelectItem value="daily">Daily</SelectItem>
      <SelectItem value="weekly">Weekly</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="space-y-2">
  <Label htmlFor="dataRetention">Data Retention (years)</Label>
  <Select 
    value={securityData.dataRetention} 
    onValueChange={(value) => setSecurityData({...securityData, dataRetention: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">1 year</SelectItem>
      <SelectItem value="3">3 years</SelectItem>
      <SelectItem value="5">5 years</SelectItem>
      <SelectItem value="7">7 years</SelectItem>
      <SelectItem value="10">10 years</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>GDPR Compliance</Label>
    <p className="text-sm text-muted-foreground">Enable EU privacy regulations</p>
  </div>
  <Switch 
    checked={securityData.gdprCompliance} 
    onCheckedChange={(checked) => setSecurityData({...securityData, gdprCompliance: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Data Export</Label>
    <p className="text-sm text-muted-foreground">Allow clients to export their data</p>
  </div>
  <Switch 
    checked={securityData.dataExport} 
    onCheckedChange={(checked) => setSecurityData({...securityData, dataExport: checked})}
  />
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
  <Switch 
    checked={securityData.failedLoginAlerts} 
    onCheckedChange={(checked) => setSecurityData({...securityData, failedLoginAlerts: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Unusual Activity Detection</Label>
    <p className="text-sm text-muted-foreground">Monitor for suspicious behavior</p>
  </div>
  <Switch 
    checked={securityData.unusualActivityDetection} 
    onCheckedChange={(checked) => setSecurityData({...securityData, unusualActivityDetection: checked})}
  />
</div>
                  <div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>New Device Notifications</Label>
    <p className="text-sm text-muted-foreground">Alert on new device logins</p>
  </div>
  <Switch 
    checked={securityData.newDeviceNotifications} 
    onCheckedChange={(checked) => setSecurityData({...securityData, newDeviceNotifications: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>API Access Monitoring</Label>
    <p className="text-sm text-muted-foreground">Track third-party integrations</p>
  </div>
  <Switch 
    checked={securityData.apiAccessMonitoring} 
    onCheckedChange={(checked) => setSecurityData({...securityData, apiAccessMonitoring: checked})}
  />
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
  <Switch 
    checked={notificationsData.newInquiries} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, newInquiries: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Payment Confirmations</Label>
    <p className="text-sm text-muted-foreground">Email receipt + dashboard alert</p>
  </div>
  <Switch 
    checked={notificationsData.paymentConfirmations} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, paymentConfirmations: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Event Reminders</Label>
    <p className="text-sm text-muted-foreground">1 week, 3 days, day-of notifications</p>
  </div>
  <Switch 
    checked={notificationsData.eventReminders} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, eventReminders: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Team Schedule Changes</Label>
    <p className="text-sm text-muted-foreground">Notify affected team members</p>
  </div>
  <Switch 
    checked={notificationsData.teamScheduleChanges} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, teamScheduleChanges: checked})}
  />
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
  <Label htmlFor="welcomeTemplate">Welcome Email Template</Label>
  <Select 
    value={notificationsData.welcomeEmailTemplate} 
    onValueChange={(value) => setNotificationsData({...notificationsData, welcomeEmailTemplate: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="professional">Professional & Detailed</SelectItem>
      <SelectItem value="friendly">Friendly & Casual</SelectItem>
      <SelectItem value="minimal">Minimal & Clean</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="space-y-2">
  <Label htmlFor="followUpSchedule">Follow-up Schedule</Label>
  <Select 
    value={notificationsData.followUpSchedule} 
    onValueChange={(value) => setNotificationsData({...notificationsData, followUpSchedule: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="immediate">Immediate follow-up</SelectItem>
      <SelectItem value="24-48">24-48 hour follow-ups</SelectItem>
      <SelectItem value="weekly">Weekly check-ins</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>SMS Notifications</Label>
    <p className="text-sm text-muted-foreground">Send SMS for urgent updates</p>
  </div>
  <Switch 
    checked={notificationsData.smsNotifications} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, smsNotifications: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Review Requests</Label>
    <p className="text-sm text-muted-foreground">Auto-request reviews post-event</p>
  </div>
  <Switch 
    checked={notificationsData.reviewRequests} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, reviewRequests: checked})}
  />
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
  <Switch 
    checked={notificationsData.autoPostEventPhotos} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, autoPostEventPhotos: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Seasonal Campaigns</Label>
    <p className="text-sm text-muted-foreground">Automated holiday promotions</p>
  </div>
  <Switch 
    checked={notificationsData.seasonalCampaigns} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, seasonalCampaigns: checked})}
  />
</div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Marketing</h4>
                    <div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Monthly Newsletter</Label>
    <p className="text-sm text-muted-foreground">Send to client mailing list</p>
  </div>
  <Switch 
    checked={notificationsData.monthlyNewsletter} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, monthlyNewsletter: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Venue Relationship Updates</Label>
    <p className="text-sm text-muted-foreground">Share with partner venues</p>
  </div>
  <Switch 
    checked={notificationsData.venueRelationshipUpdates} 
    onCheckedChange={(checked) => setNotificationsData({...notificationsData, venueRelationshipUpdates: checked})}
  />
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
  <div className="flex gap-2">
    <Button
      variant={aiData.designCreativityLevel === "conservative" ? "default" : "outline"}
      size="sm"
      onClick={() => setAiData({...aiData, designCreativityLevel: "conservative"})}
      className="flex-1"
    >
      Conservative
    </Button>
    <Button
      variant={aiData.designCreativityLevel === "balanced" ? "default" : "outline"}
      size="sm"
      onClick={() => setAiData({...aiData, designCreativityLevel: "balanced"})}
      className="flex-1"
    >
      Balanced
    </Button>
    <Button
      variant={aiData.designCreativityLevel === "creative" ? "default" : "outline"}
      size="sm"
      onClick={() => setAiData({...aiData, designCreativityLevel: "creative"})}
      className="flex-1"
    >
      Creative
    </Button>
  </div>
</div>
                <div className="space-y-2">
  <Label htmlFor="budgetEstimation">Budget Estimation</Label>
  <Select 
    value={aiData.budgetEstimation} 
    onValueChange={(value) => setAiData({...aiData, budgetEstimation: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="conservative">Conservative estimates</SelectItem>
      <SelectItem value="balanced">Balanced approach</SelectItem>
      <SelectItem value="optimistic">Optimistic projections</SelectItem>
    </SelectContent>
  </Select>
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Seasonal Adjustments</Label>
    <p className="text-sm text-muted-foreground">AI learns seasonal preferences</p>
  </div>
  <Switch 
    checked={aiData.seasonalAdjustments} 
    onCheckedChange={(checked) => setAiData({...aiData, seasonalAdjustments: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Client Style Learning</Label>
    <p className="text-sm text-muted-foreground">Remember individual client preferences</p>
  </div>
  <Switch 
    checked={aiData.clientStyleLearning} 
    onCheckedChange={(checked) => setAiData({...aiData, clientStyleLearning: checked})}
  />
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
  <Switch 
    checked={aiData.autoTaskCreation} 
    onCheckedChange={(checked) => setAiData({...aiData, autoTaskCreation: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Email Auto-Responses</Label>
    <p className="text-sm text-muted-foreground">Send immediate acknowledgments</p>
  </div>
  <Switch 
    checked={aiData.emailAutoResponses} 
    onCheckedChange={(checked) => setAiData({...aiData, emailAutoResponses: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Inventory Reorder Alerts</Label>
    <p className="text-sm text-muted-foreground">Alert when supplies run low</p>
  </div>
  <Switch 
    checked={aiData.inventoryReorderAlerts} 
    onCheckedChange={(checked) => setAiData({...aiData, inventoryReorderAlerts: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Performance Monitoring</Label>
    <p className="text-sm text-muted-foreground">Auto-generate performance reports</p>
  </div>
  <Switch 
    checked={aiData.performanceMonitoring} 
    onCheckedChange={(checked) => setAiData({...aiData, performanceMonitoring: checked})}
  />
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
  <Switch 
    checked={aiData.aiModelImprovements} 
    onCheckedChange={(checked) => setAiData({...aiData, aiModelImprovements: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Personalization Learning</Label>
    <p className="text-sm text-muted-foreground">Learn from your workflow patterns</p>
  </div>
  <Switch 
    checked={aiData.personalizationLearning} 
    onCheckedChange={(checked) => setAiData({...aiData, personalizationLearning: checked})}
  />
</div>
                  </div>
                  <div className="space-y-4">
                  <div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Industry Trend Analysis</Label>
    <p className="text-sm text-muted-foreground">Participate in market research</p>
  </div>
  <Switch 
    checked={aiData.industryTrendAnalysis} 
    onCheckedChange={(checked) => setAiData({...aiData, industryTrendAnalysis: checked})}
  />
</div>
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Usage Analytics</Label>
    <p className="text-sm text-muted-foreground">Share anonymous usage statistics</p>
  </div>
  <Switch 
    checked={aiData.usageAnalytics} 
    onCheckedChange={(checked) => setAiData({...aiData, usageAnalytics: checked})}
  />
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
  <Input 
    id="billingEmail" 
    value={billingData.billingEmail}
    onChange={(e) => setBillingData({...billingData, billingEmail: e.target.value})}
  />
</div>
<div className="space-y-2">
  <Label htmlFor="billingAddress">Billing Address</Label>
  <Textarea 
    id="billingAddress" 
    rows={3}
    value={billingData.billingAddress}
    onChange={(e) => setBillingData({...billingData, billingAddress: e.target.value})}
  />
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

{/* Recipes Tab */}
<TabsContent value="recipes" className="space-y-6">
  <Card className="shadow-card">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            Recipe Templates
          </CardTitle>
          <CardDescription>
            Create reusable recipe templates with ingredients and labor
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => {
  if (!editingRecipe) return; // Ensure editingRecipe is defined
  setEditingRecipe({
    id: editingRecipe.id,
    name: editingRecipe.name,
    category: editingRecipe.category,
    description: editingRecipe.description,
    estimated_labor_hours: editingRecipe.estimated_labor_hours,
    estimated_cost: editingRecipe.estimated_cost,
    typical_client_price: editingRecipe.typical_client_price,
    notes: editingRecipe.notes,
    ingredients: (editingRecipe.ingredients || []).map(ing => ({
      catalog_item_id: ing.catalog_item_id,
      catalog_item_type: ing.catalog_item_type,
      quantity: ing.quantity
    })) || []
  });
  setRecipeDialogOpen(true);
}}>
          <Plus className="w-4 h-4 mr-2" />
          Add Recipe
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {recipeData.map((recipe) => (
          <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium">{recipe.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{recipe.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {recipe.ingredients?.length || 0} ingredients
                </span>
                <span className="text-sm text-muted-foreground">
                  {recipe.estimated_labor_hours}hrs labor
                </span>
                <span className="text-sm font-semibold text-primary">
                  ~${recipe.typical_client_price?.toFixed(2)}
                </span>
              </div>
              {recipe.description && (
                <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
  size="sm" 
  variant="ghost"
  onClick={() => {
    setEditingRecipe({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      description: recipe.description,
      estimated_labor_hours: recipe.estimated_labor_hours,
      estimated_cost: recipe.estimated_cost,
      typical_client_price: recipe.typical_client_price,
      notes: recipe.notes,
      ingredients: recipe.ingredients
    });
    setRecipeDialogOpen(true);
  }}
>
  <Eye className="w-4 h-4 mr-1" />
  View
</Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from('recipe_templates')
                      .update({ is_active: false })
                      .eq('id', recipe.id);
                    
                    if (error) throw error;
                    await fetchRecipeData();
                    toast({ title: 'Success', description: 'Recipe deleted' });
                  } catch (error) {
                    console.error('Error deleting recipe:', error);
                    toast({ title: 'Error', description: 'Failed to delete recipe', variant: 'destructive' });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {recipeData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No recipes yet. Create your first recipe template.
          </p>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>

{/* Recipe Dialog */}
<Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>{editingRecipe?.id ? 'Recipe Details' : 'Add New Recipe'}</DialogTitle>
  </DialogHeader>
  <div className="space-y-4">
    {/* All your form fields stay the same, just add disabled={!!editingRecipe?.id} to inputs when in view mode */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Recipe Name *</Label>
          <Input
            value={editingRecipe?.name || ''}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
            placeholder="Bridal Bouquet - Classic"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={editingRecipe?.category || 'bouquet'}
            onValueChange={(value) => setEditingRecipe({ ...editingRecipe, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bouquet">Bouquet</SelectItem>
              <SelectItem value="centerpiece">Centerpiece</SelectItem>
              <SelectItem value="arrangement">Arrangement</SelectItem>
              <SelectItem value="boutonniere">Boutonniere</SelectItem>
              <SelectItem value="corsage">Corsage</SelectItem>
              <SelectItem value="arch">Arch/Installation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={editingRecipe?.description || ''}
          onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
          rows={2}
          placeholder="Classic romantic bouquet with blush tones"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Labor Hours</Label>
          <Input
            type="number"
            step="0.5"
            value={editingRecipe?.estimated_labor_hours || 0}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, estimated_labor_hours: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Est. Cost</Label>
          <Input
            type="number"
            step="0.01"
            value={editingRecipe?.estimated_cost || 0}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, estimated_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Typical Client Price</Label>
          <Input
            type="number"
            step="0.01"
            value={editingRecipe?.typical_client_price || 0}
            onChange={(e) => setEditingRecipe({ ...editingRecipe, typical_client_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={editingRecipe?.notes || ''}
          onChange={(e) => setEditingRecipe({ ...editingRecipe, notes: e.target.value })}
          rows={2}
        />
      </div>

      {/* Ingredient Builder */}
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label>Recipe Ingredients</Label>
    <Button 
      type="button" 
      size="sm" 
      variant="outline"
      onClick={() => {
        const newIngredients = editingRecipe?.ingredients || [];
        setEditingRecipe({
          ...editingRecipe,
          ingredients: [
            ...newIngredients,
            { catalog_item_id: '', catalog_item_type: 'flower', quantity: 1 }
          ]
        });
      }}
    >
      <Plus className="w-3 h-3 mr-1" />
      Add Ingredient
    </Button>
  </div>

  <div className="space-y-2 max-h-64 overflow-y-auto">
    {editingRecipe?.ingredients?.map((ingredient, index) => (
      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
        <div className="col-span-2">
          <Select
            value={ingredient.catalog_item_type}
            onValueChange={(value) => {
              const updated = [...(editingRecipe.ingredients || [])];
              updated[index] = { ...ingredient, catalog_item_type: value, catalog_item_id: '' };
              setEditingRecipe({ ...editingRecipe, ingredients: updated });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flower">Flower</SelectItem>
              <SelectItem value="hardgood">Hard Good</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-7">
          <Select
            value={ingredient.catalog_item_id}
            onValueChange={(value) => {
              const updated = [...(editingRecipe.ingredients || [])];
              updated[index] = { ...ingredient, catalog_item_id: value };
              setEditingRecipe({ ...editingRecipe, ingredients: updated });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select item..." />
            </SelectTrigger>
            <SelectContent>
              {catalogItems
                .filter(item => item.type === ingredient.catalog_item_type)
                .map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - ${item.base_price?.toFixed(2)}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Input
            type="number"
            step="0.1"
            value={ingredient.quantity}
            onChange={(e) => {
              const updated = [...(editingRecipe.ingredients || [])];
              updated[index] = { ...ingredient, quantity: parseFloat(e.target.value) || 1 };
              setEditingRecipe({ ...editingRecipe, ingredients: updated });
            }}
            className="h-8 text-xs"
            placeholder="Qty"
          />
        </div>

        <div className="col-span-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              const updated = (editingRecipe.ingredients || []).filter((_, i) => i !== index);
              setEditingRecipe({ ...editingRecipe, ingredients: updated });
            }}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    ))}
  </div>

  {(!editingRecipe?.ingredients || editingRecipe.ingredients.length === 0) && (
    <p className="text-sm text-muted-foreground text-center py-4">
      No ingredients yet. Click "Add Ingredient" to start building your recipe.
    </p>
  )}
</div>
    </div>
    
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setRecipeDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={async () => {
        if (!editingRecipe?.name || !organization) return;

        try {
          if (editingRecipe.id) {
  // Update existing recipe
  const { error } = await supabase
    .from('recipe_templates')
    .update({
      name: editingRecipe.name,
      type: 'recipe',
      category: editingRecipe.category,
      description: editingRecipe.description,
      estimated_labor_hours: editingRecipe.estimated_labor_hours,
      estimated_cost: editingRecipe.estimated_cost,
      typical_client_price: editingRecipe.typical_client_price,
      notes: editingRecipe.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', editingRecipe.id);

  if (error) throw error;

  // Delete existing ingredients and re-insert
  await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', editingRecipe.id);

  if (editingRecipe.ingredients && editingRecipe.ingredients.length > 0) {
    const ingredientsToInsert = editingRecipe.ingredients
      .filter(ing => ing.catalog_item_id) // Only save if item selected
      .map(ing => ({
        recipe_id: editingRecipe.id,
        catalog_item_id: ing.catalog_item_id,
        catalog_item_type: ing.catalog_item_type,
        quantity: ing.quantity
      }));

    if (ingredientsToInsert.length > 0) {
      const { error: ingError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingError) throw ingError;
    }
  }
} else {
  // Create new recipe
  const { data: newRecipe, error } = await supabase
    .from('recipe_templates')
    .insert({
      organization_id: organization.id,
      name: editingRecipe.name,
      type: 'recipe',
      category: editingRecipe.category,
      description: editingRecipe.description,
      estimated_labor_hours: editingRecipe.estimated_labor_hours || 0,
      estimated_cost: editingRecipe.estimated_cost || 0,
      typical_client_price: editingRecipe.typical_client_price || 0,
      notes: editingRecipe.notes
    })
    .select()
    .single();

  if (error) throw error;

  // Insert ingredients for new recipe
  if (newRecipe && editingRecipe.ingredients && editingRecipe.ingredients.length > 0) {
    const ingredientsToInsert = editingRecipe.ingredients
      .filter(ing => ing.catalog_item_id)
      .map(ing => ({
        recipe_id: newRecipe.id,
        catalog_item_id: ing.catalog_item_id,
        catalog_item_type: ing.catalog_item_type,
        quantity: ing.quantity
      }));

    if (ingredientsToInsert.length > 0) {
      const { error: ingError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingError) throw ingError;
    }
  }
}

          await fetchRecipeData();
          setRecipeDialogOpen(false);
          setEditingRecipe(null);

          toast({
            title: 'Success',
            description: editingRecipe.id ? 'Recipe updated' : 'Recipe created'
          });
        } catch (error) {
          console.error('Error saving recipe:', error);
          toast({
            title: 'Error',
            description: 'Failed to save recipe',
            variant: 'destructive'
          });
        }
      }}>
        {editingRecipe?.id ? 'Update Recipe' : 'Create Recipe'}
      </Button>
    </div>
  </DialogContent>
</Dialog>

      </Tabs>

{/* Flower Dialog */}
<Dialog open={catalogDialogOpen === 'flower'} onOpenChange={() => setCatalogDialogOpen(null)}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{editingCatalogItem?.id ? 'Edit Flower' : 'Add New Flower'}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={editingCatalogItem?.name || ''}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
            placeholder="Rose"
          />
        </div>
        <div className="space-y-2">
          <Label>Variety</Label>
          <Input
            value={editingCatalogItem?.variety || ''}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, variety: e.target.value })}
            placeholder="Garden"
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input
            value={editingCatalogItem?.color || ''}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, color: e.target.value })}
            placeholder="Blush Pink"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Base Price *</Label>
          <Input
            type="number"
            step="0.01"
            value={editingCatalogItem?.base_price || 0}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, base_price: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={editingCatalogItem?.unit || 'stem'}
            onValueChange={(value) => setEditingCatalogItem({ ...editingCatalogItem, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stem">Stem</SelectItem>
              <SelectItem value="bunch">Bunch</SelectItem>
              <SelectItem value="bunch-10">Bunch (10)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Color Hex</Label>
          <div className="flex gap-2">
            <Input
              value={editingCatalogItem?.color_hex || ''}
              onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, color_hex: e.target.value })}
              placeholder="#F4C2C2"
            />
            <input
              type="color"
              value={editingCatalogItem?.color_hex || '#FFFFFF'}
              onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, color_hex: e.target.value })}
              className="w-12 h-10 rounded border cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred Vendor</Label>
        <Input
          value={editingCatalogItem?.preferred_vendor || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, preferred_vendor: e.target.value })}
          placeholder="Wholesale Flowers Inc."
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={editingCatalogItem?.is_year_round || false}
          onCheckedChange={(checked) => setEditingCatalogItem({ ...editingCatalogItem, is_year_round: checked })}
        />
        <Label>Available Year-Round</Label>
      </div>
{!editingCatalogItem?.is_year_round && (
  <div className="space-y-2">
    <Label>Available Months</Label>
    <Input
      value={editingCatalogItem?.seasonal_months || ''}
      onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, seasonal_months: e.target.value })}
      placeholder="e.g., April-October or Spring, Summer"
    />
    <p className="text-xs text-muted-foreground">Specify when this flower is available</p>
  </div>
)}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={editingCatalogItem?.notes || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setCatalogDialogOpen(null)}>Cancel</Button>
      <Button onClick={saveCatalogItem}>Save Flower</Button>
    </div>
  </DialogContent>
</Dialog>

{/* Hard Good Dialog */}
<Dialog open={catalogDialogOpen === 'hardgood'} onOpenChange={() => setCatalogDialogOpen(null)}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{editingCatalogItem?.id ? 'Edit Hard Good' : 'Add New Hard Good'}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={editingCatalogItem?.name || ''}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
            placeholder="Cylinder Vase"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={editingCatalogItem?.category || 'vase'}
            onValueChange={(value) => setEditingCatalogItem({ ...editingCatalogItem, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vase">Vase</SelectItem>
              <SelectItem value="foam">Foam</SelectItem>
              <SelectItem value="wire">Wire</SelectItem>
              <SelectItem value="ribbon">Ribbon</SelectItem>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="tape">Tape</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Purchase Price</Label>
          <Input
            type="number"
            step="0.01"
            value={editingCatalogItem?.purchase_price || 0}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, purchase_price: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Rental Price</Label>
          <Input
            type="number"
            step="0.01"
            value={editingCatalogItem?.rental_price || 0}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, rental_price: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Input
            value={editingCatalogItem?.unit || 'each'}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, unit: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Size/Dimensions</Label>
        <Input
          value={editingCatalogItem?.size_dimensions || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, size_dimensions: e.target.value })}
          placeholder='8" height'
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred Vendor</Label>
        <Input
          value={editingCatalogItem?.preferred_vendor || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, preferred_vendor: e.target.value })}
        />
      </div>
    </div>
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setCatalogDialogOpen(null)}>Cancel</Button>
      <Button onClick={saveCatalogItem}>Save Hard Good</Button>
    </div>
  </DialogContent>
</Dialog>

{/* Labor Rate Dialog */}
<Dialog open={catalogDialogOpen === 'labor'} onOpenChange={() => setCatalogDialogOpen(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingCatalogItem?.id ? 'Edit Hard Good' : 'Add New Hard Good'}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input
          value={editingCatalogItem?.name || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })}
          placeholder="Design Consultation"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={editingCatalogItem?.category || 'design'}
          onValueChange={(value) => setEditingCatalogItem({ ...editingCatalogItem, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="assembly">Assembly</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="setup">Setup</SelectItem>
            <SelectItem value="breakdown">Breakdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hourly Rate *</Label>
          <Input
            type="number"
            step="0.01"
            value={editingCatalogItem?.hourly_rate || 0}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, hourly_rate: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Minimum Hours</Label>
          <Input
            type="number"
            step="0.5"
            value={editingCatalogItem?.minimum_hours || 1.0}
            onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, minimum_hours: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={editingCatalogItem?.default_for_category || false}
          onCheckedChange={(checked) => setEditingCatalogItem({ ...editingCatalogItem, default_for_category: checked })}
        />
        <Label>Use as default for this category</Label>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={editingCatalogItem?.description || ''}
          onChange={(e) => setEditingCatalogItem({ ...editingCatalogItem, description: e.target.value })}
          rows={2}
        />
      </div>
    </div>
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setCatalogDialogOpen(null)}>Cancel</Button>
      <Button onClick={saveCatalogItem}>Save Labor Rate</Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}

function setCatalogDialogOpen(arg0: string) {
  throw new Error("Function not implemented.");
}
