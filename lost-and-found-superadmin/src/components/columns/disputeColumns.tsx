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
  Eye,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  UserCheck,
  Calendar,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import type { Dispute } from "@/types/dispute.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface ColumnActions {
  onView?: (dispute: Dispute) => void;
  onAddMessage?: (dispute: Dispute) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onResolve?: (dispute: Dispute) => void;
  onEscalate?: (dispute: Dispute) => void;
  onAssignAdmin?: (dispute: Dispute) => void;
  onArchive?: (id: string) => void;
}

// Status badge configuration
const statusConfig = {
  open: { label: "Open", variant: "destructive" as const, icon: AlertTriangle },
  under_review: {
    label: "Under Review",
    variant: "destructive" as const,
    icon: Eye,
  },
  escalated: {
    label: "Escalated",
    variant: "destructive" as const,
    icon: ArrowUpCircle,
  },
  resolved: {
    label: "Resolved",
    variant: "success" as const,
    icon: CheckCircle,
  },
  closed: { label: "Closed", variant: "secondary" as const, icon: FileText },
};

// Priority badge configuration
const priorityConfig = {
  low: { label: "Low", variant: "default" as const, color: "bg-gray-500" },
  medium: {
    label: "Medium",
    variant: "default" as const,
    color: "bg-yellow-500",
  },
  high: {
    label: "High",
    variant: "destructive" as const,
    color: "bg-orange-500",
  },
  urgent: {
    label: "Urgent",
    variant: "destructive" as const,
    color: "bg-red-600",
  },
};

export const disputeColumns = ({
  onAddMessage,
  onUpdateStatus,
  onEscalate,
  onAssignAdmin,
  onArchive,
}: ColumnActions): ColumnDef<Dispute>[] => [
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
    accessorKey: "title",
    header: "Dispute",
    cell: ({ row }) => {
      const dispute = row.original;
      return (
        <Link to={`/disputes/${dispute._id}`} className="max-w-[300px]">
          <div className="max-w-[300px]">
            <div className="truncate font-medium">{dispute.title}</div>
            <div className="text-muted-foreground mt-1 text-xs">
              Item: {dispute.itemId?.itemName || "N/A"}
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
    cell: ({ row }) => {
      const reporter = row.original.reportedBy;
      return (
        <div className="flex items-center gap-2">
          {reporter?.avatar ? (
            <img
              src={reporter.avatar}
              alt={reporter.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
              <span className="text-primary text-xs font-medium">
                {reporter?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{reporter?.name || "N/A"}</div>
            <div className="text-muted-foreground max-w-[150px] truncate text-xs">
              {reporter?.email || ""}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "reportedAgainst",
    header: "Reported Against",
    cell: ({ row }) => {
      const reported = row.original.reportedAgainst;
      return (
        <div className="flex items-center gap-2">
          {reported?.avatar ? (
            <img
              src={reported.avatar}
              alt={reported.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="bg-destructive/10 flex h-6 w-6 items-center justify-center rounded-full">
              <span className="text-destructive text-xs font-medium">
                {reported?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{reported?.name || "N/A"}</div>
            <div className="text-muted-foreground max-w-[150px] truncate text-xs">
              {reported?.email || ""}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeLabels: Record<string, string> = {
        wrongful_claim: "Wrongful Claim",
        item_damage: "Item Damage",
        fake_item: "Fake Item",
        harassment: "Harassment",
        communication_issue: "Communication Issue",
        other: "Other",
      };
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="capitalize">
                {typeLabels[type] || type.replace("_", " ")}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dispute Type</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig;
      const config = statusConfig[status] || statusConfig.open;
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as keyof typeof priorityConfig;
      const config = priorityConfig[priority] || priorityConfig.medium;
      return (
        <Badge variant={config.variant} className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedAdmin",
    header: "Assigned Admin",
    cell: ({ row }) => {
      const admin = row.original.assignedAdmin;
      return admin ? (
        <div className="flex items-center gap-2">
          <UserCheck className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{admin.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="text-muted-foreground h-4 w-4" />
        <span className="text-sm">
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "messages",
    header: "Messages",
    cell: ({ row }) => {
      const messages = row.original.messages;
      const count = messages?.length || 0;
      return (
        <div className="flex items-center gap-1">
          <MessageSquare className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dispute = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(dispute._id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                to={`/disputes/${dispute._id}`}
                className="flex w-full items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>

            {onAddMessage && (
              <DropdownMenuItem onClick={() => onAddMessage(dispute)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Message
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Status Update Actions */}
            {onUpdateStatus && dispute.status === "open" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(dispute._id, "under_review")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Mark as Under Review
              </DropdownMenuItem>
            )}

            {onUpdateStatus && dispute.status === "under_review" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(dispute._id, "resolved")}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Resolve Dispute
              </DropdownMenuItem>
            )}

            {onEscalate && dispute.status !== "escalated" && (
              <DropdownMenuItem onClick={() => onEscalate(dispute)}>
                <ArrowUpCircle className="mr-2 h-4 w-4 text-orange-600" />
                Escalate to Super Admin
              </DropdownMenuItem>
            )}

            {onAssignAdmin && !dispute.assignedAdmin && (
              <DropdownMenuItem onClick={() => onAssignAdmin(dispute)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Assign Admin
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Archive Action (Super Admin only) */}
            {onArchive && (
              <DropdownMenuItem
                onClick={() => onArchive(dispute._id)}
                className="text-destructive"
              >
                <FileText className="mr-2 h-4 w-4" />
                Archive Dispute
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
