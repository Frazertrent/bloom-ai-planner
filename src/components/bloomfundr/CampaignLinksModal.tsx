import { useState } from "react";
import { Copy, Check, Download, Link as LinkIcon, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface StudentLink {
  studentName: string;
  studentId: string;
  magicLinkCode: string;
  fullUrl: string;
}

interface CampaignLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  studentLinks: StudentLink[];
  trackingMode?: 'none' | 'individual' | 'self_register';
  campaignLink?: string | null;
  selfRegisterLink?: string | null;
}

export function CampaignLinksModal({
  open,
  onOpenChange,
  campaignName,
  studentLinks,
  trackingMode = 'individual',
  campaignLink,
  selfRegisterLink,
}: CampaignLinksModalProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [campaignLinkCopied, setCampaignLinkCopied] = useState(false);
  const [selfRegisterCopied, setSelfRegisterCopied] = useState(false);

  const copySelfRegisterLink = async () => {
    if (!selfRegisterLink) return;
    try {
      await navigator.clipboard.writeText(selfRegisterLink);
      setSelfRegisterCopied(true);
      setTimeout(() => setSelfRegisterCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "The registration link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, studentId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(studentId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  const copyCampaignLink = async () => {
    if (!campaignLink) return;
    try {
      await navigator.clipboard.writeText(campaignLink);
      setCampaignLinkCopied(true);
      setTimeout(() => setCampaignLinkCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "The campaign link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyAllLinks = async () => {
    const allLinks = studentLinks
      .map((link) => `${link.studentName}: ${link.fullUrl}`)
      .join("\n");
    
    try {
      await navigator.clipboard.writeText(allLinks);
      toast({
        title: "All links copied!",
        description: `${studentLinks.length} links have been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadCSV = () => {
    const headers = ["Student Name", "Magic Link Code", "Full URL"];
    const rows = studentLinks.map((link) => [
      link.studentName,
      link.magicLinkCode,
      link.fullUrl,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${campaignName.replace(/\s+/g, "_")}_links.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV downloaded",
      description: "Student links have been downloaded as a CSV file.",
    });
  };

  // For 'none' tracking mode, show campaign link only
  if (trackingMode === 'none') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Campaign Link
            </DialogTitle>
            <DialogDescription>
              Share this link with anyone to let them order from your fundraiser.
              All sales will be attributed to the campaign.
            </DialogDescription>
          </DialogHeader>

          {campaignLink ? (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Your Campaign Link</p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={campaignLink}
                        className="bg-background text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyCampaignLink}
                      >
                        {campaignLinkCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={copyCampaignLink}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <a href={campaignLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Link
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No campaign link available.</p>
              <p className="text-sm mt-1">Campaign links are generated when the campaign is created.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // For 'self_register' mode, show registration link prominently + any registered sellers
  if (trackingMode === 'self_register') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Campaign Links
            </DialogTitle>
            <DialogDescription>
              Share the registration link with your sellers so they can sign up and get their own selling links.
            </DialogDescription>
          </DialogHeader>

          {/* Self-Registration Link - Prominent */}
          {selfRegisterLink && (
            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Seller Registration Link
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
                      Send this to your sellers so they can register and get their own unique selling link.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={selfRegisterLink}
                        className="bg-background text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copySelfRegisterLink}
                      >
                        {selfRegisterCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={copySelfRegisterLink}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <a href={selfRegisterLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Link
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registered Sellers Section */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Registered Sellers ({studentLinks.length})
            </p>
            {studentLinks.length > 0 ? (
              <>
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="sm" onClick={copyAllLinks}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Links
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {studentLinks.map((link) => (
                      <div
                        key={link.studentId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{link.studentName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              readOnly
                              value={link.fullUrl}
                              className="h-8 text-xs bg-background"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(link.fullUrl, link.studentId)}
                        >
                          {copiedId === link.studentId ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sellers have registered yet.</p>
                <p className="text-xs mt-1">They'll appear here after joining via the registration link above.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // For 'individual' mode, show student links
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Seller Links
          </DialogTitle>
          <DialogDescription>
            Share these unique links with each seller. They can share their link
            with friends and family to attribute sales.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={copyAllLinks}>
            <Copy className="mr-2 h-4 w-4" />
            Copy All Links
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {studentLinks.length > 0 ? (
              studentLinks.map((link) => (
                <div
                  key={link.studentId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{link.studentName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        readOnly
                        value={link.fullUrl}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(link.fullUrl, link.studentId)}
                  >
                    {copiedId === link.studentId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sellers assigned to this campaign yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
