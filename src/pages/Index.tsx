import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, Brain, FileText, Calendar, DollarSign, Users, Star, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroFlorals from "@/assets/hero-florals.jpg";
import weddingVenue from "@/assets/wedding-venue.jpg";
import aiFloristWorkspace from "@/assets/ai-florist-workspace.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AI Florist Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Floral Business
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
                  Transform Your{" "}
                  <span className="text-primary">Floral Business</span>{" "}
                  with AI Magic
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload consultation recordings and watch AI generate complete event plans, 
                  floral orders, venue layouts, schedules, and professional proposals in minutes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-lg px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img 
                src={heroFlorals} 
                alt="Beautiful wedding bouquet showcasing professional floral artistry"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Everything You Need to Scale Your Floral Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From consultation to completion, our AI platform handles the complex planning 
              so you can focus on creating beautiful floral experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Audio Consultation Processing",
                description: "Upload client recordings and AI extracts all event details, preferences, and requirements automatically."
              },
              {
                icon: Brain,
                title: "Smart Event Planning",
                description: "AI generates complete event plans including floral arrangements, quantities, and seasonal recommendations."
              },
              {
                icon: FileText,
                title: "Professional Proposals",
                description: "Create stunning client proposals with layouts, timelines, and detailed investment breakdowns."
              },
              {
                icon: Calendar,
                title: "Timeline Management",
                description: "Automated scheduling with prep days, delivery windows, setup times, and team coordination."
              },
              {
                icon: DollarSign,
                title: "Budget Optimization",
                description: "Real-time cost calculations, profit margin tracking, and multiple pricing tier options."
              },
              {
                icon: Users,
                title: "Team Coordination",
                description: "Staff assignments, role management, and workload distribution for seamless execution."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 bg-background/60 backdrop-blur hover:bg-background/80 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              How It Works
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              From Consultation to Completion in 4 Simple Steps
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Upload Consultation Audio",
                  description: "Record or upload your client consultation. Our AI transcribes and extracts all the important details - venue, dates, budget, flower preferences, and special requests."
                },
                {
                  step: "02", 
                  title: "AI Generates Event Plan",
                  description: "Within minutes, receive a complete event plan with stem counts, arrangement suggestions, venue layouts, and timeline recommendations tailored to your client's vision."
                },
                {
                  step: "03",
                  title: "Review and Customize",
                  description: "Fine-tune the AI-generated plan. Adjust quantities, swap flowers, modify layouts, and add your creative touches to make it perfectly yours."
                },
                {
                  step: "04",
                  title: "Export Professional Proposal",
                  description: "Generate a stunning client proposal with visual layouts, detailed timelines, and investment breakdowns. Send directly or download as PDF."
                }
              ].map((step, index) => (
                <div key={index} className="flex space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img 
                src={aiFloristWorkspace} 
                alt="Modern florist using AI technology in professional workspace"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Trusted by Florists
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Join Thousands of Successful Florists
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                business: "Bloom & Bliss Florals",
                image: "SC",
                text: "This platform transformed my business. I can now handle 3x more events with the same team. The AI planning is incredibly accurate and saves me hours of work."
              },
              {
                name: "Marcus Rivera", 
                business: "Garden Grove Events",
                image: "MR",
                text: "The audio consultation feature is a game-changer. Clients love how detailed and professional my proposals are now. My booking rate increased by 40%."
              },
              {
                name: "Emma Thompson",
                business: "Wildflower Wedding Co.",
                image: "ET", 
                text: "I was skeptical about AI, but this platform understands floral design better than I expected. It's like having an experienced assistant who never sleeps."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 bg-background/60 backdrop-blur">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {testimonial.image}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={weddingVenue} 
            alt="Elegant wedding venue with professional floral arrangements"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/80" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-background">
              Ready to Transform Your Floral Business?
            </h2>
            <p className="text-xl text-background/80">
              Join thousands of florists who have streamlined their workflow and increased 
              their revenue with AI-powered business management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 bg-background text-foreground hover:bg-background/90">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 border-background text-background hover:bg-background/10">
                  Schedule Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-background/60">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6" />
                <span className="text-lg font-bold">AI Florist Platform</span>
              </div>
              <p className="text-background/70">
                Empowering florists with AI-driven business management tools.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-background/70">
                <p>Features</p>
                <p>Pricing</p>
                <p>Demo</p>
                <p>API</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-background/70">
                <p>About</p>
                <p>Blog</p>
                <p>Careers</p>
                <p>Contact</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-background/70">
                <p>Help Center</p>
                <p>Community</p>
                <p>Privacy</p>
                <p>Terms</p>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/70">
            <p>&copy; 2024 AI Florist Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}