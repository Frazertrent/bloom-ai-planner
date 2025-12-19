import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import heic2any from "heic2any";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerAvatarUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  name: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const isHeicFile = (file: File): boolean => {
  const heicTypes = ['image/heic', 'image/heif'];
  const heicExtensions = ['.heic', '.heif'];
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return heicTypes.includes(file.type.toLowerCase()) || heicExtensions.includes(extension);
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

export function SellerAvatarUpload({ 
  value, 
  onChange, 
  name, 
  disabled,
  size = "md" 
}: SellerAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !isHeicFile(file)) {
      toast.error("Please select an image file");
      return;
    }

    // 5MB limit for avatars
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload: File | Blob = file;
      let finalExtension = file.name.split(".").pop() || "jpg";

      // Convert HEIC to JPEG
      if (isHeicFile(file)) {
        setUploadStatus("Converting...");
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
      const filePath = `avatars/${fileName}`;

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
      toast.success("Photo uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
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
    toast.success("Photo removed");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
      
      {isUploading ? (
        <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : (
        <div 
          className="relative cursor-pointer group"
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <Avatar className={`${sizeClasses[size]} border-2 border-primary/20 transition-all group-hover:border-primary/50`}>
            <AvatarImage src={value || undefined} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          {/* Overlay with camera icon */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          
          {/* Remove button if has avatar */}
          {value && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {!value && !isUploading && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Tap to add photo
        </p>
      )}
    </div>
  );
}

// Simpler display-only avatar with ranking ring
interface SellerAvatarProps {
  src: string | null;
  name: string;
  rank?: number;
  size?: "xs" | "sm" | "md";
}

const displaySizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
};

export function SellerAvatar({ src, name, rank, size = "sm" }: SellerAvatarProps) {
  const ringColor = rank === 1 
    ? "ring-amber-500" 
    : rank === 2 
    ? "ring-slate-400" 
    : rank === 3 
    ? "ring-amber-700" 
    : "ring-transparent";

  return (
    <Avatar className={`${displaySizeClasses[size]} ${rank && rank <= 3 ? `ring-2 ${ringColor}` : ""}`}>
      <AvatarImage src={src || undefined} alt={name} className="object-cover" />
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
