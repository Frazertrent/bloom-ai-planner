import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import Header from "@/components/bloomfundr/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Link as LinkIcon, Calendar } from "lucide-react";

const OrgDashboard = () => {
  const { profile } = useBloomFundrAuth();

  return (
    <div className="min-h-screen bg-bloomfundr-background">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name || "Organization"}!
            </h1>
            <p className="text-muted-foreground">
              Create campaigns and track your fundraising progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-bloomfundr-card border-bloomfundr-muted">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Campaigns
                </CardTitle>
                <Calendar className="h-5 w-5 text-bloomfundr-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
              </CardContent>
            </Card>

            <Card className="bg-bloomfundr-card border-bloomfundr-muted">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="h-5 w-5 text-bloomfundr-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
              </CardContent>
            </Card>

            <Card className="bg-bloomfundr-card border-bloomfundr-muted">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Links Shared
                </CardTitle>
                <LinkIcon className="h-5 w-5 text-bloomfundr-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
              </CardContent>
            </Card>

            <Card className="bg-bloomfundr-card border-bloomfundr-muted">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Funds Raised
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-bloomfundr-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">$0.00</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader>
              <CardTitle className="text-foreground">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your organization dashboard is ready! Soon you'll be able to:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bloomfundr-secondary" />
                  Create fundraising campaigns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bloomfundr-secondary" />
                  Add students and generate unique selling links
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bloomfundr-secondary" />
                  Track sales in real-time
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bloomfundr-secondary" />
                  Receive automatic payouts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OrgDashboard;
