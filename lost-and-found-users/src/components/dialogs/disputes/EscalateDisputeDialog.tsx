// components/disputes/EscalateDisputeDialog.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEscalateDispute } from "@/hooks/useDisputes";
import type { Dispute } from "@/types/dispute.types";
import { Loader2, ArrowUpCircle, AlertTriangle } from "lucide-react";

interface EscalateDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: Dispute | null;
  onSuccess?: () => void;
}

export const EscalateDisputeDialog = ({
  open,
  onOpenChange,
  dispute,
  onSuccess,
}: EscalateDisputeDialogProps) => {
  const [reason, setReason] = useState("");

  const { mutate: escalateDispute, isPending, error } = useEscalateDispute();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute || !reason.trim()) return;

    escalateDispute(
      {
        id: dispute._id,
        data: { reason: reason.trim() },
      },
      {
        onSuccess: () => {
          setReason("");
          onSuccess?.();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <ArrowUpCircle className="h-5 w-5" />
              Escalate Dispute
            </DialogTitle>
            <DialogDescription>
              Escalate this dispute to a super admin for higher-level review and
              resolution. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dispute Info */}
            {dispute && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">{dispute.title}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">
                    Status: {dispute.status.replace(/_/g, " ")}
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

            {/* Warning Card */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Before escalating, please ensure:
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-yellow-700">
                      <li>You have reviewed all evidence and messages</li>
                      <li>
                        You have attempted to resolve the dispute at college
                        level
                      </li>
                      <li>This dispute requires super admin intervention</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Escalation Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this dispute needs to be escalated to a super admin..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                required
                className="resize-none"
              />
              <p className="text-muted-foreground text-xs">
                Provide a clear explanation for escalation. This will be shared
                with the super admin.
              </p>
            </div>

            {/* Character Counter */}
            <div className="text-muted-foreground text-right text-xs">
              {reason.length} / 1000 characters
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-blue-700">
                <li>A super admin will be notified immediately</li>
                <li>The dispute status will change to "Escalated"</li>
                <li>Both parties will be notified of the escalation</li>
                <li>You may be contacted for additional information</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || "Failed to escalate dispute"}
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
              disabled={!reason.trim() || reason.length < 10 || isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Escalate to Super Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
