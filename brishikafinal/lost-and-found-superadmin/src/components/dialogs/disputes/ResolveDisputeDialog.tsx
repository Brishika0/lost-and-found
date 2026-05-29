import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useResolveDispute } from "@/hooks/useDisputes";
import type { Dispute, ResolutionType } from "@/types/dispute.types";
import { Loader2, CheckCircle } from "lucide-react";

interface ResolveDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: Dispute | null;
  onSuccess?: () => void;
}

const resolutionTypes = [
  { value: "resolved_in_favor_of_reporter", label: "In Favor of Reporter" },
  { value: "resolved_in_favor_of_other", label: "In Favor of Reported User" },
  { value: "mutual_agreement", label: "Mutual Agreement" },
  { value: "no_action", label: "No Action Taken" },
  { value: "other", label: "Other" },
];

const updateItemOptions = [
  { value: "none", label: "Don't update item status" },
  { value: "claimed", label: "Mark item as Claimed" },
  { value: "returned", label: "Mark item as Returned" },
];

export const ResolveDisputeDialog = ({
  open,
  onOpenChange,
  dispute,
  onSuccess,
}: ResolveDisputeDialogProps) => {
  const [resolutionType, setResolutionType] = useState<ResolutionType>(
    "resolved_in_favor_of_reporter",
  );
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [updateItemStatus, setUpdateItemStatus] = useState<
    "claimed" | "returned" | "none"
  >("none");

  const { mutate: resolveDispute, isPending, error } = useResolveDispute();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;

    resolveDispute(
      {
        id: dispute._id,
        data: {
          resolutionType,
          description: description.trim(),
          actionTaken: actionTaken.trim() || undefined,
          updateItemStatus:
            updateItemStatus === "none" ? undefined : updateItemStatus,
        },
      },
      {
        onSuccess: () => {
          setResolutionType("resolved_in_favor_of_reporter");
          setDescription("");
          setActionTaken("");
          setUpdateItemStatus("none");
          onSuccess?.();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution details for this dispute. This action will
              notify all parties involved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dispute Info */}
            {dispute && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">{dispute.title}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">
                    Type: {dispute.type.replace(/_/g, " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      dispute.priority === "urgent"
                        ? "border-red-500 text-red-600"
                        : dispute.priority === "high"
                          ? "border-orange-500 text-orange-600"
                          : ""
                    }
                  >
                    Priority: {dispute.priority}
                  </Badge>
                </div>
              </div>
            )}

            {/* Resolution Type */}
            <div className="space-y-2">
              <Label>Resolution Type</Label>
              <RadioGroup
                value={resolutionType}
                onValueChange={(value) =>
                  setResolutionType(value as ResolutionType)
                }
                className="space-y-2"
              >
                {resolutionTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Resolution Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Resolution Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe how the dispute was resolved..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
              <p className="text-muted-foreground text-xs">
                This description will be shared with both parties
              </p>
            </div>

            {/* Action Taken */}
            <div className="space-y-2">
              <Label htmlFor="actionTaken">Action Taken (Optional)</Label>
              <Textarea
                id="actionTaken"
                placeholder="Describe any actions taken (e.g., item returned, user warned, etc.)..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
              />
            </div>

            {/* Update Item Status */}
            <div className="space-y-2">
              <Label>Update Item Status</Label>
              <Select
                value={updateItemStatus}
                onValueChange={(value: any) => setUpdateItemStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {updateItemOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Optionally update the associated item's status based on the
                resolution
              </p>
            </div>

            {/* Preview */}
            {resolutionType && description && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  Resolution Summary
                </p>
                <p className="mt-1 text-sm text-green-700">
                  <strong>Type:</strong>{" "}
                  {
                    resolutionTypes.find((t) => t.value === resolutionType)
                      ?.label
                  }
                </p>
                <p className="mt-1 text-sm text-green-700">
                  <strong>Description:</strong> {description}
                </p>
                {updateItemStatus !== "none" && (
                  <p className="mt-1 text-sm text-green-700">
                    <strong>Item will be:</strong>{" "}
                    {updateItemStatus === "claimed"
                      ? "Marked as Claimed"
                      : "Marked as Returned"}
                  </p>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || "Failed to resolve dispute"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve Dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
