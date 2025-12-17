import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import heic2any from "heic2any";

interface ProductImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const isHeicFile = (file: File): boolean => {
  const heicTypes = ['image/heic', 'image/heif'];
  const heicExtensions = ['.heic', '.heif'];
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return heicTypes.includes(file.type.toLowerCase()) || heicExtensions.includes(extension);
};

export function ProductImageUpload({ value, onChange, disabled }: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !isHeicFile(file)) {
      toast.error("Please select an image file");
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload: File | Blob = file;
      let finalExtension = file.name.split(".").pop() || "jpg";

      // Convert HEIC to JPEG
      if (isHeicFile(file)) {
        setUploadStatus("Converting HEIC...");
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        fileToUpload = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        finalExtension = "jpg";
      }

      setUploadStatus("Uploading...");
      const fileName = `${crypto.randomUUID()}.${finalExtension}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathParts = url.pathname.split("/product-images/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from("product-images").remove([filePath]);
      }
    } catch (error) {
      console.error("Error removing file:", error);
    }

    onChange(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  if (value) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Product Image</label>
        <div className="relative rounded-lg border border-bloomfundr-muted overflow-hidden bg-bloomfundr-background">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click the X to remove and upload a different image
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Product Image</label>
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-6 transition-colors
          ${dragActive 
            ? "border-bloomfundr-primary bg-bloomfundr-primary/5" 
            : "border-bloomfundr-muted hover:border-bloomfundr-primary/50"
          }
          ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-bloomfundr-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{uploadStatus || "Uploading..."}</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-bloomfundr-primary/10">
                <Upload className="h-6 w-6 text-bloomfundr-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, HEIC up to 10MB • iPhone photos supported
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
