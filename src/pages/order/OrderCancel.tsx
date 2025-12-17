import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Flower, ArrowLeft, RefreshCw } from "lucide-react";

export default function OrderCancel() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flower className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">Fundraiser</h1>
              <p className="text-sm text-muted-foreground">Payment Cancelled</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-amber-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            Your payment was not completed. No charges have been made.
          </p>

          <Card className="bg-card border-border text-left mb-8">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  If you experienced any issues during checkout, please try again or contact support.
                </p>
                <p className="text-muted-foreground">
                  Your cart items are still saved and you can return to complete your purchase.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to={`/order/${magicLinkCode}/checkout`}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/order/${magicLinkCode}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
