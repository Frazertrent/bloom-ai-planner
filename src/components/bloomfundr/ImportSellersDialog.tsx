import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgForStudents } from "@/hooks/useOrgStudents";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

interface ImportSellersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedSeller {
  name: string;
  email?: string;
  phone?: string;
  grade?: string;
  team_group?: string;
  rowNumber: number;
}

interface ImportResult {
  success: number;
  skipped: number;
  errors: string[];
  duplicates: string[];
}

function generateUniqueCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = lines.slice(1).map((line) => parseCSVLine(line));

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapRowToSeller(
  row: string[],
  headers: string[],
  rowNumber: number
): ParsedSeller | null {
  const getValue = (possibleNames: string[]): string | undefined => {
    for (const name of possibleNames) {
      const idx = headers.indexOf(name);
      if (idx !== -1 && row[idx]) return row[idx].trim();
    }
    return undefined;
  };

  const name = getValue(["name", "seller name", "student name", "full name", "seller"]);
  if (!name) return null;

  return {
    name,
    email: getValue(["email", "email address", "e-mail"]),
    phone: getValue(["phone", "phone number", "telephone", "mobile"]),
    grade: getValue(["grade", "year", "class"]),
    team_group: getValue(["team", "group", "team/group", "team_group", "squad"]),
    rowNumber,
  };
}

export function ImportSellersDialog({ open, onOpenChange }: ImportSellersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: org } = useOrgForStudents();

  const [file, setFile] = useState<File | null>(null);
  const [parsedSellers, setParsedSellers] = useState<ParsedSeller[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload");

  const resetState = () => {
    setFile(null);
    setParsedSellers([]);
    setParseErrors([]);
    setImportResult(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { headers, rows } = parseCSV(content);

      if (headers.length === 0 || rows.length === 0) {
        setParseErrors(["CSV file is empty or has no data rows."]);
        return;
      }

      // Check for required column
      const hasNameColumn = ["name", "seller name", "student name", "full name", "seller"].some(
        (n) => headers.includes(n)
      );
      if (!hasNameColumn) {
        setParseErrors([
          'CSV must have a "Name" column. Supported column names: Name, Seller Name, Student Name, Full Name',
        ]);
        return;
      }

      const sellers: ParsedSeller[] = [];
      const errors: string[] = [];

      rows.forEach((row, idx) => {
        const seller = mapRowToSeller(row, headers, idx + 2); // +2 for 1-indexed + header row
        if (seller) {
          sellers.push(seller);
        } else if (row.some((cell) => cell.trim())) {
          errors.push(`Row ${idx + 2}: Missing required "Name" field`);
        }
      });

      setParsedSellers(sellers);
      setParseErrors(errors);
      setStep("preview");
    };

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Failed to read the CSV file.",
        variant: "destructive",
      });
    };

    reader.readAsText(selectedFile);
  };

  const importMutation = useMutation({
    mutationFn: async (sellers: ParsedSeller[]) => {
      if (!org?.id) throw new Error("Organization not found");

      // Fetch existing sellers by email to detect duplicates
      const emailsToCheck = sellers
        .filter((s) => s.email)
        .map((s) => s.email!.toLowerCase());

      const { data: existingSellers } = await supabase
        .from("bf_students")
        .select("email")
        .eq("organization_id", org.id)
        .in("email", emailsToCheck);

      const existingEmails = new Set(
        (existingSellers || []).map((s) => s.email?.toLowerCase())
      );

      const result: ImportResult = {
        success: 0,
        skipped: 0,
        errors: [],
        duplicates: [],
      };

      // Process sellers in batches
      const toInsert: any[] = [];

      for (const seller of sellers) {
        // Check for duplicate by email
        if (seller.email && existingEmails.has(seller.email.toLowerCase())) {
          result.duplicates.push(`${seller.name} (${seller.email})`);
          result.skipped++;
          continue;
        }

        toInsert.push({
          organization_id: org.id,
          name: seller.name,
          email: seller.email || null,
          phone: seller.phone || null,
          grade: seller.grade || null,
          team_group: seller.team_group || null,
          unique_code: generateUniqueCode(),
          is_active: true,
        });

        // Track this email to prevent duplicates within the same import
        if (seller.email) {
          existingEmails.add(seller.email.toLowerCase());
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from("bf_students").insert(toInsert);

        if (error) {
          throw error;
        }

        result.success = toInsert.length;
      }

      return result;
    },
    onSuccess: (result) => {
      setImportResult(result);
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["bf-org-students"] });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setStep("preview");
    },
  });

  const handleImport = () => {
    setStep("importing");
    importMutation.mutate(parsedSellers);
  };

  const downloadTemplate = () => {
    const template = "Name,Email,Phone,Grade,Team/Group\nJohn Smith,john@example.com,(555) 123-4567,Junior,Varsity\nJane Doe,jane@example.com,(555) 987-6543,Sophomore,JV";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seller_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Sellers from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import sellers into your organization.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {/* Download Template */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download our CSV template to get started
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click to upload CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 500 sellers per import
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Column Info */}
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Required column:</strong> Name
                <br />
                <strong>Optional columns:</strong> Email, Phone, Grade, Team/Group
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedSellers.length} seller{parsedSellers.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetState}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            {parseErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Parse Warnings:</p>
                  <ul className="text-xs space-y-1">
                    {parseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li>...and {parseErrors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {parsedSellers.length > 0 && (
              <>
                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-3 space-y-2">
                    {parsedSellers.slice(0, 20).map((seller, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                      >
                        <div>
                          <p className="font-medium">{seller.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[seller.email, seller.grade, seller.team_group]
                              .filter(Boolean)
                              .join(" · ") || "No additional info"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Row {seller.rowNumber}
                        </Badge>
                      </div>
                    ))}
                    {parsedSellers.length > 20 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        ...and {parsedSellers.length - 20} more
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetState}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleImport}>
                    Import {parsedSellers.length} Seller{parsedSellers.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />
            <p className="font-medium">Importing sellers...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {step === "complete" && importResult && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
              <p className="text-lg font-semibold">Import Complete!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-600">{importResult.success}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>

            {importResult.duplicates.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Duplicates skipped:</p>
                  <ul className="text-xs space-y-1">
                    {importResult.duplicates.slice(0, 5).map((dup, i) => (
                      <li key={i}>{dup}</li>
                    ))}
                    {importResult.duplicates.length > 5 && (
                      <li>...and {importResult.duplicates.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
