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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Gift,
  Star,
  Users,
  User,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LostItem, UpdateStatusRequest } from "@/types/lostItem.types";
import { useGetStudents } from "@/hooks/useUsers";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LostItem;
  onConfirm: (id: string, data: UpdateStatusRequest) => Promise<void>;
  isUpdating?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isUpdating = false,
}: StatusUpdateDialogProps) {
  const [selectedActionUserId, setSelectedActionUserId] = useState<string>("");
  const [selectedRewardUserId, setSelectedRewardUserId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchRewardTerm, setSearchRewardTerm] = useState<string>("");

  // Get status options based on current status
  const getStatusOption = () => {
    if (item.status === "lost") {
      return {
        value: "returned",
        label: "Mark as Returned",
        description: "Item has been returned to the owner",
        icon: CheckCircle,
        color: "purple",
        actionUserLabel: "Who returned the item? (Returned By)",
        actionUserField: "returnedTo" as const,
        rewardUserLabel: "Who should receive the reward? (Rewarded To)",
        rewardField: "rewardedTo" as const,
        helpText:
          "Select who returned the item and who should receive the reward",
        rewardPoints: 100,
      };
    }

    if (item.status === "found") {
      return {
        value: "claimed",
        label: "Mark as Claimed",
        description: "Owner has claimed the item",
        icon: UserCheck,
        color: "blue",
        actionUserLabel: "Who is claiming the item? (Claimed By)",
        actionUserField: "claimedBy" as const,
        rewardUserLabel: "Who should receive the reward? (Rewarded To)",
        rewardField: "rewardedTo" as const,
        helpText:
          "Select who is claiming the item and who should receive the reward",
        rewardPoints: 30,
      };
    }

    return null;
  };

  const statusOption = getStatusOption();
  const StatusIcon = statusOption?.icon || CheckCircle;

  // Fetch users for the action dropdown
  const { data: usersData, isLoading: usersLoading } = useGetStudents({
    collegeId: item.collegeId._id,
    search: searchTerm,
    limit: 20,
  });

  // Fetch users for the reward dropdown (same data, separate search)
  const { data: rewardUsersData, isLoading: rewardUsersLoading } =
    useGetStudents({
      collegeId: item.collegeId._id,
      search: searchRewardTerm,
      limit: 20,
    });

  const handleConfirm = async () => {
    if (!statusOption || !selectedActionUserId) return;

    const updateData: UpdateStatusRequest = {
      status: statusOption.value as any,
      [statusOption.actionUserField]: selectedActionUserId,
      [statusOption.rewardField]: selectedRewardUserId,
    };

    await onConfirm(item._id, updateData);

    // Reset form
    setSelectedActionUserId("");
    setSelectedRewardUserId("");
    setNotes("");
    setSearchTerm("");
    setSearchRewardTerm("");
  };

  const isValid = () => {
    if (!statusOption) return false;
    if (!selectedActionUserId) return false;
    return true;
  };

  const selectedActionUser = usersData?.data?.find(
    (u: User) => u._id === selectedActionUserId,
  );
  const selectedRewardUser = rewardUsersData?.data?.find(
    (u: User) => u._id === selectedRewardUserId,
  );

  // If no status option available
  if (!statusOption) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status Update Unavailable</DialogTitle>
            <DialogDescription>
              This item has already been {item.status} and cannot be updated
              further.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto p-0 sm:max-w-lg">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Update Item Status
            </DialogTitle>
            <DialogDescription>
              Update the status of "{item.itemName}" and assign rewards
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6 px-6 py-4">
          {/* Current Status Display */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <Badge
                className={cn(
                  "mt-1 capitalize",
                  item.status === "lost" && "bg-red-100 text-red-600",
                  item.status === "found" && "bg-green-100 text-green-600",
                )}
              >
                {item.status}
              </Badge>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">New Status</p>
              <Badge
                className={cn(
                  "mt-1 capitalize",
                  statusOption.value === "claimed" &&
                    "bg-blue-100 text-blue-600",
                  statusOption.value === "returned" &&
                    "bg-purple-100 text-purple-600",
                )}
              >
                {statusOption.label}
              </Badge>
            </div>
          </div>

          {/* Info Card */}
          <Alert
            className={cn(
              item.status === "lost" &&
                "flex gap-2 border-purple-200 bg-purple-50",
              item.status === "found" &&
                "flex gap-2 border-blue-200 bg-blue-50",
            )}
          >
            <div
              className={cn(
                "rounded-full p-2",
                item.status === "lost" && "bg-purple-100",
                item.status === "found" && "bg-blue-100",
              )}
            >
              {item.status === "lost" ? (
                <CheckCircle className="h-4 w-4 text-purple-600" />
              ) : (
                <UserCheck className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{statusOption.helpText}</p>
              <p className="mt-1 text-sm text-gray-600">
                Reward: {statusOption.rewardPoints} points will be awarded
              </p>
            </div>
          </Alert>

          {/* Owner Info (for context) */}
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-xs text-gray-500">Item Owner</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {item.reportedBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{item.reportedBy.name}</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
            </div>
          </div>

          {/* Action User Selection (Who performed the action) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {statusOption.actionUserLabel}
            </Label>
            <Select
              value={selectedActionUserId}
              onValueChange={setSelectedActionUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select user`} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="sticky top-0 bg-white p-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {usersLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  usersData?.data?.map((u: User) => (
                    <SelectItem key={u._id} value={u._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {u.avatar ? (
                            <AvatarImage src={u.avatar} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="flex-1 truncate">{u.name}</span>
                        <span className="hidden text-xs text-gray-400 sm:inline">
                          {u.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedActionUser && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                <Avatar>
                  {selectedActionUser.avatar ? (
                    <AvatarImage src={selectedActionUser.avatar} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedActionUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedActionUser.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedActionUser.email}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {item.status === "lost" ? "Returned By" : "Claimed By"}
                </Badge>
              </div>
            )}
          </div>

          {/* Reward User Selection (Who gets the reward) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              {statusOption.rewardUserLabel}
            </Label>
            <Select
              value={selectedRewardUserId}
              onValueChange={setSelectedRewardUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user to receive reward" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="sticky top-0 bg-white p-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchRewardTerm}
                    onChange={(e) => setSearchRewardTerm(e.target.value)}
                  />
                </div>
                {rewardUsersLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  rewardUsersData?.data?.map((u: User) => (
                    <SelectItem key={u._id} value={u._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {u.avatar ? (
                            <AvatarImage src={u.avatar} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="flex-1 truncate">{u.name}</span>
                        <span className="hidden text-xs text-gray-400 sm:inline">
                          {u.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedRewardUser && (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                <Avatar>
                  {selectedRewardUser.avatar ? (
                    <AvatarImage src={selectedRewardUser.avatar} />
                  ) : (
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {selectedRewardUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedRewardUser.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedRewardUser.email}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Will receive {statusOption.rewardPoints} points
                </Badge>
              </div>
            )}
          </div>

          {/* Reward Points Info */}
          <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <Gift className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <div className="flex items-center justify-between">
                <span>
                  {statusOption.rewardPoints} points will be awarded to the
                  selected user!
                </span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              {selectedRewardUser && (
                <div className="mt-2 text-xs text-gray-600">
                  {selectedRewardUser.name} will receive{" "}
                  {statusOption.rewardPoints} points
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Notes */}
          <div className="space-y-3">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional information about this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action is irreversible. Once marked as {statusOption.value},
              the item will be considered resolved and cannot be changed back.
            </AlertDescription>
          </Alert>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 border-t bg-white px-6 py-4">
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid() || isUpdating}
              className={cn(
                statusOption.value === "claimed" &&
                  "bg-blue-600 hover:bg-blue-700",
                statusOption.value === "returned" &&
                  "bg-purple-600 hover:bg-purple-700",
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Confirm {statusOption.label}</>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
