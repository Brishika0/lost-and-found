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
  Power,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import type { LostItem } from "@/types/lostItem.types";
import { DeleteConfirmation } from "../dialogs/deleteConfirmationDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ColumnActions {
  onView?: (item: LostItem) => void;
  onEdit?: (item: LostItem) => void;
  onVerify?: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onResolveFlags?: (id: string, action: "keep" | "remove") => void;
}

const statusColors = {
  lost: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  found: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  claimed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  returned:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const statusLabels = {
  lost: "Lost",
  found: "Found",
  claimed: "Claimed",
  returned: "Returned",
};

export const lostItemColumns = ({
  onView,
  onVerify,
  onToggleStatus,
  onDelete,
  onPermanentDelete,
  onResolveFlags,
}: ColumnActions): ColumnDef<LostItem>[] => [
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
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const primaryImage =
        row.original.images?.find((img) => img.isPrimary) ||
        row.original.images?.[0];
      return (
        <div className="bg-muted h-12 w-12 overflow-hidden rounded-md border">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={row.original.itemName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-xs">No img</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Link to={`/posts/${item._id}`} className="max-w-[200px]">
          <div className="truncate font-medium">{item.itemName}</div>
          {item.subCategory && (
            <div className="text-muted-foreground truncate text-xs">
              {item.subCategory}
            </div>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {row.getValue("description")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={cn(statusColors[status], "whitespace-nowrap")}>
          {statusLabels[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
    cell: ({ row }) => {
      const reportedBy = row.original.reportedBy;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={reportedBy?.avatar} />
            <AvatarFallback className="text-xs">
              {reportedBy?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="max-w-[120px] truncate text-sm font-medium">
              {reportedBy?.name}
            </div>
            <div className="text-muted-foreground max-w-[120px] truncate text-xs">
              {reportedBy?.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "locationDescription",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("locationDescription") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <MapPin className="text-muted-foreground h-3 w-3" />
                <span className="max-w-[150px] truncate text-sm">
                  {location}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{location}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "dateLost",
    header: "Date Lost",
    cell: ({ row }) => {
      const dateLost = row.getValue("dateLost") as string;
      return dateLost ? (
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-3 w-3" />
          <span className="text-sm">
            {format(new Date(dateLost), "dd/MM/yyyy")}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
  },
  {
    accessorKey: "dateFound",
    header: "Date Found",
    cell: ({ row }) => {
      const dateFound = row.getValue("dateFound") as string;
      return dateFound ? (
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-3 w-3" />
          <span className="text-sm">
            {format(new Date(dateFound), "dd/MM/yyyy")}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant={isActive ? "success" : "destructive"}
          className="whitespace-nowrap"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified") as boolean;
      return (
        <div className="flex items-center justify-center">
          {isVerified ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "flagCount",
    header: "Flags",
    cell: ({ row }) => {
      const flagCount = row.getValue("flagCount") as number;
      return flagCount > 0 ? (
        <Badge variant="destructive" className="gap-1">
          <Flag className="h-3 w-3" />
          {flagCount}
        </Badge>
      ) : (
        <Badge variant="outline">0</Badge>
      );
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-sm font-medium">{row.getValue("views")}</span>
      </div>
    ),
  },
  {
    accessorKey: "likesCount",
    header: "Likes",
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-sm font-medium">
          {row.getValue("likesCount")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="text-muted-foreground h-3 w-3" />
        <span className="text-sm">
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

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
              onClick={() => navigator.clipboard.writeText(item._id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {onView && (
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}

            {onVerify && !item.isVerified && (
              <DropdownMenuItem onClick={() => onVerify(item._id)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Verify Item
              </DropdownMenuItem>
            )}

            {onToggleStatus && (
              <DropdownMenuItem
                onClick={() => onToggleStatus(item._id, item.isActive)}
              >
                <Power className="mr-2 h-4 w-4" />
                {item.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            )}

            {item.flagCount > 0 && onResolveFlags && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Handle Flags</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onResolveFlags(item._id, "keep")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Keep Item
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResolveFlags(item._id, "remove")}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  Remove Item
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Soft Delete */}
            <DropdownMenuItem asChild>
              <DeleteConfirmation
                title="Delete Item"
                description={`Are you sure you want to delete "${item.itemName}"? This action can be reversed.`}
                onConfirm={() => onDelete(item._id)}
                buttonText="Soft Delete"
              />
            </DropdownMenuItem>

            {/* Permanent Delete */}
            {onPermanentDelete && (
              <DropdownMenuItem asChild>
                <DeleteConfirmation
                  title="Permanently Delete Item"
                  description={`Are you sure you want to permanently delete "${item.itemName}"? This action cannot be undone.`}
                  onConfirm={() => onPermanentDelete(item._id)}
                  buttonText="Permanently Delete"
                />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
