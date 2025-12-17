import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, Link, Loader2, UserPlus, Users } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CampaignWizardState,
  useAvailableFlorists,
  useOrgForCampaign,
  useSaveCampaignDraft,
} from "@/hooks/useCampaignWizard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const trackingModeOptions = [
  {
    value: "none" as const,
    title: "Campaign Total Only",
    description: "One shared link for everyone. No individual seller tracking.",
    hint: "Best for simple fundraisers",
    icon: Link,
  },
  {
    value: "individual" as const,
    title: "Individual Sellers",
    description: "You add sellers manually. Each gets a unique link.",
    hint: "Best when you need accountability",
    icon: Users,
  },
  {
    value: "self_register" as const,
    title: "Self-Registration",
    description: "Sellers sign themselves up and get unique links automatically.",
    hint: "Best for large groups",
    icon: UserPlus,
  },
];

const step1Schema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  eventOccasion: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  pickupDate: z.date().optional(),
  pickupLocation: z.string().optional(),
  floristId: z.string().min(1, "Please select a florist partner"),
  trackingMode: z.enum(["none", "individual", "self_register"]),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type Step1FormValues = z.infer<typeof step1Schema>;

interface Step1BasicInfoProps {
  wizardState: CampaignWizardState;
  campaignId?: string;
  onSave: (campaignId: string) => void;
  onContinue: (campaignId: string) => void;
  updateWizardState: (updates: Partial<CampaignWizardState>) => void;
}

export function Step1BasicInfo({
  wizardState,
  campaignId,
  onSave,
  onContinue,
  updateWizardState,
}: Step1BasicInfoProps) {
  const { data: florists, isLoading: floristsLoading } = useAvailableFlorists();
  const { data: org, isLoading: orgLoading } = useOrgForCampaign();
  const saveDraft = useSaveCampaignDraft();

  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: wizardState.name,
      description: wizardState.description,
      eventOccasion: wizardState.eventOccasion,
      startDate: wizardState.startDate,
      endDate: wizardState.endDate,
      pickupDate: wizardState.pickupDate,
      pickupLocation: wizardState.pickupLocation,
      floristId: wizardState.floristId,
      trackingMode: wizardState.trackingMode,
    },
  });

  // Reset form when wizardState is populated from campaign data
  useEffect(() => {
    if (wizardState.name) {
      form.reset({
        name: wizardState.name,
        description: wizardState.description,
        eventOccasion: wizardState.eventOccasion,
        startDate: wizardState.startDate,
        endDate: wizardState.endDate,
        pickupDate: wizardState.pickupDate,
        pickupLocation: wizardState.pickupLocation,
        floristId: wizardState.floristId,
        trackingMode: wizardState.trackingMode,
      });
    }
  }, [wizardState.name, wizardState.floristId, wizardState.startDate, wizardState.trackingMode]);

  const handleSaveDraft = async () => {
    const values = form.getValues();
    
    // Update wizard state
    updateWizardState(values);

    if (!org?.id) return;

    // Validate required fields for draft
    if (!values.name || !values.startDate || !values.endDate || !values.floristId) {
      form.trigger();
      return;
    }

    const result = await saveDraft.mutateAsync({
      campaignId,
      organizationId: org.id,
      data: values as CampaignWizardState,
    });

    if (result?.id) {
      onSave(result.id);
    }
  };

  const handleContinue = async (values: Step1FormValues) => {
    updateWizardState(values);

    if (!org?.id) return;

    const result = await saveDraft.mutateAsync({
      campaignId,
      organizationId: org.id,
      data: values as CampaignWizardState,
    });

    if (result?.id) {
      onContinue(result.id);
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!org?.id) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Organization Required</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Please add your organization details in Settings before creating a campaign.</p>
          <Button asChild size="sm">
            <RouterLink to="/org/settings">Go to Settings</RouterLink>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Campaign Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Campaign Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Spring Flower Sale 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell customers about this fundraiser..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event/Occasion */}
          <FormField
            control={form.control}
            name="eventOccasion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event / Occasion</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Homecoming 2024, Prom" {...field} />
                </FormControl>
                <FormDescription>
                  Optional - helps customers understand the purpose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Florist Selection */}
          <FormField
            control={form.control}
            name="floristId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Florist Partner *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a florist" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {floristsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading florists...
                      </SelectItem>
                    ) : florists && florists.length > 0 ? (
                      florists.map((florist) => {
                        const locationParts = [florist.city, florist.state].filter(Boolean);
                        const locationString = locationParts.length > 0 ? ` - ${locationParts.join(", ")}` : "";
                        return (
                          <SelectItem key={florist.id} value={florist.id}>
                            <span>
                              {florist.business_name}
                              {locationString && (
                                <span className="text-muted-foreground">{locationString}</span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="none" disabled>
                        No verified florists available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() ||
                        (form.getValues("startDate") && date <= form.getValues("startDate"))
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seller Pickup Date */}
          <FormField
            control={form.control}
            name="pickupDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Seller Pickup Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        form.getValues("endDate") && date < form.getValues("endDate")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When sellers pick up flowers from the florist for delivery
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seller Pickup Location */}
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Florist Shop, School Main Office" {...field} />
                </FormControl>
                <FormDescription>
                  Where sellers will pick up orders for delivery to customers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tracking Mode Selection */}
        <div className="space-y-4 pt-6 border-t">
          <div>
            <Label className="text-base font-semibold">How do you want to track sales?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how sellers will be assigned and tracked for this campaign.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="trackingMode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {trackingModeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = field.value === option.value;
                      return (
                        <Card
                          key={option.value}
                          className={cn(
                            "cursor-pointer transition-all hover:border-primary/50",
                            isSelected && "border-primary ring-2 ring-primary/20 bg-primary/5"
                          )}
                          onClick={() => field.onChange(option.value)}
                        >
                          <CardHeader className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className={cn(
                                "p-2 rounded-md",
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                isSelected ? "border-primary" : "border-muted-foreground/30"
                              )}>
                                {isSelected && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">
                                {option.title}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {option.description}
                              </CardDescription>
                              <p className="text-xs text-primary mt-2 font-medium">
                                {option.hint}
                              </p>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saveDraft.isPending}
          >
            {saveDraft.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save as Draft
          </Button>
          <Button type="submit" disabled={saveDraft.isPending}>
            {saveDraft.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to Products
          </Button>
        </div>
      </form>
    </Form>
  );
}
