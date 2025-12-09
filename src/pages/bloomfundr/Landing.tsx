import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/bloomfundr/Header";
import { 
  Calendar, 
  Share2, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  LinkIcon,
  Flower2,
  Building2,
  ArrowRight
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-bloomfundr-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-bloomfundr-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 md:w-96 h-64 md:h-96 bg-bloomfundr-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-bloomfundr-muted text-bloomfundr-primary text-xs md:text-sm font-medium mb-4 md:mb-6">
            <Flower2 className="w-3 h-3 md:w-4 md:h-4" />
            <span>The Future of Floral Fundraising</span>
          </div>
          
          <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            Floral Fundraising
            <br />
            <span className="bg-gradient-to-r from-bloomfundr-primary to-bloomfundr-secondary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-4">
            Connect florists, schools, and supporters for beautiful fundraising campaigns. 
            Automate payments, track sales, and maximize profits.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4">
            <Button
              size="lg"
              asChild
              className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light text-bloomfundr-primary-foreground shadow-lg hover:shadow-xl transition-all group min-h-[48px] w-full sm:w-auto"
            >
              <Link to="/fundraiser/register?role=florist" className="flex items-center justify-center gap-2">
                <Flower2 className="w-5 h-5" />
                I'm a Florist
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-bloomfundr-secondary text-bloomfundr-secondary hover:bg-bloomfundr-secondary hover:text-bloomfundr-secondary-foreground shadow-lg hover:shadow-xl transition-all group min-h-[48px] w-full sm:w-auto"
            >
              <Link to="/fundraiser/register?role=organization" className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5" />
                I'm an Organization
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-bloomfundr-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Launch a successful floral fundraiser in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-bloomfundr-primary/20 to-bloomfundr-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-10 h-10 text-bloomfundr-primary" />
              </div>
              <div className="text-sm font-semibold text-bloomfundr-primary mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Schools Create Campaigns</h3>
              <p className="text-muted-foreground">
                Organizations set up campaigns with products, pricing, and timelines in minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-bloomfundr-secondary/20 to-bloomfundr-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 className="w-10 h-10 text-bloomfundr-secondary" />
              </div>
              <div className="text-sm font-semibold text-bloomfundr-secondary mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Students Share Links</h3>
              <p className="text-muted-foreground">
                Each student gets a unique link to share with friends and family.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-bloomfundr-primary/20 to-bloomfundr-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-10 h-10 text-bloomfundr-primary" />
              </div>
              <div className="text-sm font-semibold text-bloomfundr-primary mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-foreground mb-3">Everyone Profits</h3>
              <p className="text-muted-foreground">
                Automatic revenue splits ensure florists, schools, and the platform all benefit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to run successful floral fundraisers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-bloomfundr-card border-bloomfundr-muted hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-bloomfundr-primary/10 flex items-center justify-center mb-4 group-hover:bg-bloomfundr-primary/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-bloomfundr-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Automated Payments</h3>
                <p className="text-muted-foreground text-sm">
                  Secure payment processing with automatic revenue distribution to all parties.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-bloomfundr-card border-bloomfundr-muted hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-bloomfundr-secondary/10 flex items-center justify-center mb-4 group-hover:bg-bloomfundr-secondary/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-bloomfundr-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Real-time Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor sales, student performance, and campaign progress as it happens.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-bloomfundr-card border-bloomfundr-muted hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-bloomfundr-primary/10 flex items-center justify-center mb-4 group-hover:bg-bloomfundr-primary/20 transition-colors">
                  <LinkIcon className="w-6 h-6 text-bloomfundr-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Easy Student Links</h3>
                <p className="text-muted-foreground text-sm">
                  Unique shareable links for each student with automatic order attribution.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-bloomfundr-primary to-bloomfundr-primary-light">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-bloomfundr-primary-foreground mb-4">
            Ready to Start Fundraising?
          </h2>
          <p className="text-bloomfundr-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join hundreds of schools and florists already using BloomFundr to run successful campaigns.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-bloomfundr-card text-bloomfundr-primary hover:bg-bloomfundr-muted shadow-xl"
          >
            <Link to="/fundraiser/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-foreground">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flower2 className="w-5 h-5 text-bloomfundr-primary" />
            <span className="text-lg font-bold text-bloomfundr-card">BloomFundr</span>
          </div>
          <p className="text-bloomfundr-muted text-sm">
            © {new Date().getFullYear()} BloomFundr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
