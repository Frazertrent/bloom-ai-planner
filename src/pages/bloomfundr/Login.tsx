import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flower2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useBloomFundrAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email before logging in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Welcome back!");
      navigate("/fundraiser/dashboard");
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
          <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your BloomFundr account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-bloomfundr-primary hover:bg-bloomfundr-primary-light text-bloomfundr-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/fundraiser/register"
                className="text-bloomfundr-primary hover:text-bloomfundr-primary-light font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
