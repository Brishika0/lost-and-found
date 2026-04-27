// columns/userColumns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Copy,
  Edit,
  Power,
  Mail,
  MailCheck,
  Shield,
  School,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type { User } from "@/types/user.types";
import { DeleteConfirmation } from "../dialogs/deleteConfirmationDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ColumnActions {
  onEdit?: (user: User) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onResendVerification?: (id: string, email: string) => void;
}

export const userColumns = ({
  onEdit,
  onToggleStatus,
  onDelete,
  onVerifyEmail,
  onResendVerification,
}: ColumnActions): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.avatar ? (
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-primary text-sm font-medium">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="font-medium">{row.getValue("name")}</div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const isVerified = row.original.isEmailVerified;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("email")}</span>
          {isVerified ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <MailCheck className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Verified</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Mail className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Not Verified</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "collegeId",
    header: "College",
    cell: ({ row }) => {
      const college = row.original.collegeId;
      return (
        <div className="flex items-center gap-2">
          <School className="text-muted-foreground h-4 w-4" />
          <span>{college?.name || college?.shortName || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          {role === "college_admin" ? "College Admin" : role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isEmailVerified",
    header: "Email Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("isEmailVerified") as boolean;
      return (
        <Badge variant={isVerified ? "success" : "destructive"}>
          {isVerified ? "Verified" : "Unverified"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ row }) => {
      const lastActive = row.getValue("lastActive") as string;
      return lastActive ? (
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          {/* <span>{format(new Date(lastActive), "MMM dd, yyyy")}</span> */}
          <span>{format(new Date(lastActive), "dd/MM/yyyy")}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Never</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="text-muted-foreground h-4 w-4" />
        <span>
          {/* {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")} */}
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user._id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onToggleStatus(user._id)}>
              <Power className="mr-2 h-4 w-4" />
              {user.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>

            {/* Email Verification Actions */}
            {!user.isEmailVerified && onVerifyEmail && (
              <DropdownMenuItem onClick={() => onVerifyEmail(user._id)}>
                <MailCheck className="mr-2 h-4 w-4 text-green-500" />
                Verify Email
              </DropdownMenuItem>
            )}

            {!user.isEmailVerified && onResendVerification && (
              <DropdownMenuItem
                onClick={() => onResendVerification(user._id, user.email)}
              >
                <Mail className="mr-2 h-4 w-4 text-yellow-500" />
                Resend Verification
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Delete with confirmation */}
            <DropdownMenuItem asChild>
              <DeleteConfirmation
                title="Delete Admin"
                description={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
                onConfirm={() => onDelete(user._id)}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
