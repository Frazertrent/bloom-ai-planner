import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flower2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["florist", "org_admin"], {
    required_error: "Please select a role",
  }),
  // Florist-specific fields
  businessName: z.string().optional(),
  // Organization-specific fields
  organizationName: z.string().optional(),
  orgType: z.enum(["school", "sports", "dance", "cheer", "church", "other"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "florist" && (!data.businessName || data.businessName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Business name is required",
  path: ["businessName"],
}).refine((data) => {
  if (data.role === "org_admin" && (!data.organizationName || data.organizationName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Organization name is required",
  path: ["organizationName"],
}).refine((data) => {
  if (data.role === "org_admin" && !data.orgType) {
    return false;
  }
  return true;
}, {
  message: "Organization type is required",
  path: ["orgType"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useBloomFundrAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") as "florist" | "organization" | null;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole === "organization" ? "org_admin" : defaultRole === "florist" ? "florist" : undefined,
      businessName: "",
      organizationName: "",
      orgType: undefined,
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(
        values.email,
        values.password,
        values.fullName,
        values.role
      );

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Get the user after signup
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create florist or organization record based on role
        if (values.role === "florist" && values.businessName) {
          const { error: floristError } = await supabase
            .from("bf_florists")
            .insert({
              user_id: user.id,
              business_name: values.businessName,
            });
          
          if (floristError) {
            console.error("Error creating florist record:", floristError);
          }
        } else if (values.role === "org_admin" && values.organizationName && values.orgType) {
          const { error: orgError } = await supabase
            .from("bf_organizations")
            .insert({
              user_id: user.id,
              name: values.organizationName,
              org_type: values.orgType,
            });
          
          if (orgError) {
            console.error("Error creating organization record:", orgError);
          }
        }
      }

      toast.success("Account created! Please check your email to confirm your account.");
      navigate("/fundraiser/login");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bloomfundr-background flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-bloomfundr-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-bloomfundr-secondary/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 bg-bloomfundr-card border-bloomfundr-muted shadow-xl">
        <CardHeader className="text-center">
          <Link to="/fundraiser" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bloomfundr-primary to-bloomfundr-primary-light flex items-center justify-center shadow-lg">
              <Flower2 className="w-7 h-7 text-bloomfundr-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join BloomFundr and start fundraising
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                        {...field}
                      />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a...</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-bloomfundr-background border-bloomfundr-muted">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="florist">Florist</SelectItem>
                        <SelectItem value="org_admin">School / Organization</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Florist-specific fields */}
              {selectedRole === "florist" && (
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Flower Shop"
                          className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Organization-specific fields */}
              {selectedRole === "org_admin" && (
                <>
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lincoln High School"
                            className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orgType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-bloomfundr-background border-bloomfundr-muted">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="sports">Sports Team</SelectItem>
                            <SelectItem value="dance">Dance Team</SelectItem>
                            <SelectItem value="cheer">Cheer Squad</SelectItem>
                            <SelectItem value="church">Church / Religious</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-bloomfundr-background border-bloomfundr-muted focus:border-bloomfundr-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-bloomfundr-primary hover:bg-bloomfundr-primary-light text-bloomfundr-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/fundraiser/login"
                className="text-bloomfundr-primary hover:text-bloomfundr-primary-light font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
