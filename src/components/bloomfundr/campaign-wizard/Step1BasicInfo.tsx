import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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

const step1Schema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  eventOccasion: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  pickupDate: z.date().optional(),
  pickupLocation: z.string().optional(),
  floristId: z.string().min(1, "Please select a florist partner"),
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
    },
  });

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
                      florists.map((florist) => (
                        <SelectItem key={florist.id} value={florist.id}>
                          <div className="flex flex-col">
                            <span>{florist.business_name}</span>
                            {florist.business_address && (
                              <span className="text-xs text-muted-foreground">
                                {florist.business_address}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
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

          {/* Pickup Date */}
          <FormField
            control={form.control}
            name="pickupDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pickup Date</FormLabel>
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
                          <span>Pick a pickup date</span>
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
                  When customers will pick up their orders
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pickup Location */}
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., School Main Office" {...field} />
                </FormControl>
                <FormDescription>
                  Where customers will pick up their orders
                </FormDescription>
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
