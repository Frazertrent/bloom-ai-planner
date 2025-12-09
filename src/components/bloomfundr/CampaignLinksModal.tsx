import { useState } from "react";
import { Copy, Check, Download, Link as LinkIcon, X } from "lucide-react";
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
}

export function CampaignLinksModal({
  open,
  onOpenChange,
  campaignName,
  studentLinks,
}: CampaignLinksModalProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Student Links
          </DialogTitle>
          <DialogDescription>
            Share these unique links with each student. They can share their link
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
      </DialogContent>
    </Dialog>
  );
}
