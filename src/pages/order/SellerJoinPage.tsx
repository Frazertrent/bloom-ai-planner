import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, AlertCircle, Copy, Share2, ExternalLink, Flower } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const joinSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().optional(),
  grade: z.string().optional(),
  teamGroup: z.string().optional(),
});

type JoinFormValues = z.infer<typeof joinSchema>;

interface RegistrationResult {
  studentId: string;
  magicLinkCode: string;
  sellingLink: string;
}

export default function SellerJoinPage() {
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  // Fetch campaign by self_register_code
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["bf-campaign-by-register-code", code],
    queryFn: async () => {
      if (!code) throw new Error("No registration code provided");

      const { data, error } = await supabase
        .from("bf_campaigns")
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          pickup_date,
          pickup_location,
          status,
          self_registration_open,
          organization_id,
          bf_organizations (
            name
          )
        `)
        .eq("self_register_code", code)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!code,
  });

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      grade: "",
      teamGroup: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: JoinFormValues) => {
      if (!campaign) throw new Error("Campaign not found");

      // Generate unique code for the student
      const uniqueCode = Math.random().toString(36).substring(2, 10);
      
      // Generate magic link code for campaign assignment
      const magicLinkCode = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

      // Create the student record
      const { data: student, error: studentError } = await supabase
        .from("bf_students")
        .insert({
          organization_id: campaign.organization_id,
          name: values.name,
          email: values.email || null,
          phone: values.phone || null,
          grade: values.grade || null,
          team_group: values.teamGroup || null,
          unique_code: uniqueCode,
          is_active: true,
        })
        .select()
        .single();

      if (studentError) {
        console.error("Error creating student:", studentError);
        throw new Error("Failed to create seller record");
      }

      // Link student to campaign
      const { error: linkError } = await supabase
        .from("bf_campaign_students")
        .insert({
          campaign_id: campaign.id,
          student_id: student.id,
          magic_link_code: magicLinkCode,
          total_sales: 0,
          order_count: 0,
        });

      if (linkError) {
        console.error("Error linking student to campaign:", linkError);
        // Clean up: delete the student we just created
        await supabase.from("bf_students").delete().eq("id", student.id);
        throw new Error("Failed to join campaign");
      }

      const sellingLink = `${window.location.origin}/order/${magicLinkCode}`;
      
      return {
        studentId: student.id,
        magicLinkCode,
        sellingLink,
      };
    },
    onSuccess: (result) => {
      setRegistrationResult(result);
      toast({
        title: "You're registered!",
        description: "Share your unique link to start selling.",
      });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    if (registrationResult?.sellingLink) {
      await navigator.clipboard.writeText(registrationResult.sellingLink);
      toast({
        title: "Link copied!",
        description: "Share this with friends and family.",
      });
    }
  };

  const handleShare = async () => {
    if (registrationResult?.sellingLink && navigator.share) {
      try {
        await navigator.share({
          title: `Support ${campaign?.name}`,
          text: `Help me raise funds! Shop beautiful flowers here:`,
          url: registrationResult.sellingLink,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state - invalid code
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Registration Link</h2>
            <p className="text-muted-foreground mb-4">
              This registration link is not valid or has expired.
            </p>
            <Button asChild variant="outline">
              <Link to="/fundraiser">Go to BloomFundr</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Campaign not accepting registrations
  if (!campaign.self_registration_open || !["draft", "active"].includes(campaign.status)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
            <p className="text-muted-foreground mb-4">
              {campaign.status !== "active" 
                ? "This campaign is not currently active."
                : "This campaign is no longer accepting new seller registrations."
              }
            </p>
            <Button asChild variant="outline">
              <Link to="/fundraiser">Go to BloomFundr</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - show the selling link
  if (registrationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription>
              Share your unique link with friends and family to start selling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">Your Selling Link:</p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={registrationResult.sellingLink}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleCopyLink} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => window.open(registrationResult.sellingLink, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview Your Selling Page
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Supporting: <span className="font-medium">{campaign.name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                by {(campaign.bf_organizations as any)?.name || "Organization"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Flower className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join as a Seller</CardTitle>
          <CardDescription>
            Sign up to get your unique selling link for
          </CardDescription>
          <p className="font-semibold text-foreground">{campaign.name}</p>
          <p className="text-sm text-muted-foreground">
            by {(campaign.bf_organizations as any)?.name || "Organization"}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => registerMutation.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10th" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team/Group (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Varsity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Get My Selling Link"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}