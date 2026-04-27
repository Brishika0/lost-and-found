// components/disputes/AddMessageDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddDisputeMessage } from "@/hooks/useDisputes";
import type { Dispute } from "@/types/dispute.types";
import { Loader2, Paperclip, X } from "lucide-react";

interface AddMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: Dispute | null;
  onSuccess?: () => void;
}

export const AddMessageDialog = ({
  open,
  onOpenChange,
  dispute,
  onSuccess,
}: AddMessageDialogProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const { mutate: addMessage, isPending, error } = useAddDisputeMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;

    addMessage(
      {
        id: dispute._id,
        data: {
          content: content.trim(),
          attachments: attachments.filter((url) => url.trim()),
        },
      },
      {
        onSuccess: () => {
          setContent("");
          setAttachments([]);
          onSuccess?.();
          onOpenChange(false);
        },
      },
    );
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim() && !attachments.includes(attachmentUrl.trim())) {
      setAttachments([...attachments, attachmentUrl.trim()]);
      setAttachmentUrl("");
    }
  };

  const handleRemoveAttachment = (url: string) => {
    setAttachments(attachments.filter((a) => a !== url));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Message</DialogTitle>
            <DialogDescription>
              Add a message to the dispute conversation. This will notify all
              parties involved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dispute Info */}
            {dispute && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Dispute: {dispute.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Item: {dispute.itemId?.itemName}
                </p>
              </div>
            )}

            {/* Message Content */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={5}
                className="resize-none"
                disabled={isPending}
              />
              <p className="text-muted-foreground text-xs">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter file URL"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  disabled={!attachmentUrl.trim() || isPending}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <span className="flex-1 truncate">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(url)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error.message || "Failed to send message"}
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
            <Button type="submit" disabled={!content.trim() || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
