import React, { useState, useRef } from "react";
import { useCreateDispute } from "@/hooks/useDisputes";
import {
  MessageCircle,
  AlertTriangle,
  Scale,
  FileText,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LostItem } from "@/types/lostItem.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LostItem;
  currentUserId: string;
  onSuccess?: () => void;
}

interface EvidenceFile {
  file: File;
  preview: string;
  type: "image" | "document" | "screenshot";
  uploading?: boolean;
  uploadedUrl?: string;
}

const disputeTypes = [
  { value: "wrongful_claim", label: "Wrongful Claim" },
  { value: "item_damage", label: "Item Damage" },
  { value: "fake_item", label: "Fake Item" },
  { value: "harassment", label: "Harassment" },
  { value: "communication_issue", label: "Communication Issue" },
  { value: "other", label: "Other" },
];

export const DisputeDialog: React.FC<DisputeDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("wrongful_claim");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createDispute, isPending, error } = useCreateDispute();

  // Simulate file upload to backend
  const uploadFileToServer = async (file: File): Promise<string> => {
    // This is where you'd make your actual API call to upload the file
    // For now, we'll simulate an upload
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful upload
        // In reality, you'd get the URL back from your server
        const fakeUrl = URL.createObjectURL(file);
        resolve(fakeUrl);
      }, 1000);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error(`Files larger than 10MB are not allowed`);
      return;
    }

    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "image/jpg",
    ];
    const invalidFiles = files.filter((f) => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error(
        `Only images (JPEG, PNG, GIF, WEBP) and PDF documents are allowed`,
      );
      return;
    }

    // Add files with preview
    const newFiles: EvidenceFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "document",
      uploading: true,
    }));

    setEvidenceFiles((prev) => [...prev, ...newFiles]);

    // Upload each file
    for (const evidenceFile of newFiles) {
      try {
        const uploadedUrl = await uploadFileToServer(evidenceFile.file);
        setEvidenceFiles((prev) =>
          prev.map((f) =>
            f.file === evidenceFile.file
              ? { ...f, uploading: false, uploadedUrl }
              : f,
          ),
        );
      } catch (error) {
        setEvidenceFiles((prev) =>
          prev.filter((f) => f.file !== evidenceFile.file),
        );
        toast.error(`Failed to upload ${evidenceFile.file.name}`);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const file = evidenceFiles[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get uploaded URLs for evidence
    const uploadedEvidence = evidenceFiles
      .filter((f) => f.uploadedUrl)
      .map((f) => ({
        url: f.uploadedUrl!,
        type: f.type,
      }));

    createDispute(
      {
        itemId: item._id,
        reportedAgainst: item.reportedBy._id,
        type: type as any,
        title: title.trim(),
        description: description.trim(),
        evidence: uploadedEvidence.length > 0 ? uploadedEvidence : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Dispute filed successfully");
          // Cleanup preview URLs
          evidenceFiles.forEach((f) => {
            if (f.preview) URL.revokeObjectURL(f.preview);
          });
          setTitle("");
          setType("wrongful_claim");
          setDescription("");
          setEvidenceFiles([]);
          onSuccess?.();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to file dispute");
          console.error("Failed to file dispute:", error);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-clip p-0 sm:max-w-[600px]">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-600" />
            File a Dispute
          </DialogTitle>
          <DialogDescription>
            Report an issue with this post. Please provide details about the
            dispute.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Item Info */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium">Item: {item.itemName}</p>
              <p className="mt-1 text-xs text-gray-500">
                Posted by: {item.reportedBy.name}
              </p>
            </div>

            {/* Dispute Type - Select Component */}
            <div className="space-y-2">
              <Label>Dispute Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dispute type" />
                </SelectTrigger>
                <SelectContent>
                  {disputeTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      <div className="flex items-center gap-2">
                        {dt.value === "wrongful_claim" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {dt.value === "item_damage" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {dt.value === "fake_item" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {dt.value === "harassment" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {dt.value === "communication_issue" && (
                          <MessageCircle className="h-4 w-4" />
                        )}
                        {dt.value === "other" && (
                          <FileText className="h-4 w-4" />
                        )}
                        {dt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Dispute Title *</Label>
              <Input
                placeholder="Brief title for the dispute"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={5}
                maxLength={5000}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {description.length}/5000 characters
              </p>
            </div>

            {/* Evidence Upload */}
            <div className="space-y-2">
              <Label>Evidence (Optional)</Label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Button */}
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                className="h-24 w-full border-2 border-dashed transition-colors hover:border-orange-500 hover:bg-orange-50"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">
                      Click to upload evidence
                    </p>
                    <p className="text-xs text-gray-500">
                      Images (JPEG, PNG, GIF, WEBP) or PDF documents (max 10MB
                      each)
                    </p>
                  </div>
                </div>
              </Button>

              {/* File List */}
              {evidenceFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {evidenceFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border bg-white p-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* Thumbnail Preview */}
                        {file.type === "image" && file.preview && (
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        {file.type === "document" && (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {file.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : file.uploadedUrl ? (
                          <Badge className="bg-green-100 text-green-700">
                            Uploaded
                          </Badge>
                        ) : null}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(idx)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Upload images or documents that support your dispute. Maximum
                10MB per file.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || "Failed to file dispute"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !description.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Scale className="mr-2 h-4 w-4" />
            File Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
