import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Copy,
  Eye,
  Star,
  Ticket,
  Calendar,
  Users,
} from "lucide-react";
import type { Coupon } from "@/types/coupon.types";
import { format } from "date-fns";
import { DeleteConfirmation } from "@/components/dialogs/deleteConfirmationDialog";
import { Link } from "react-router-dom";

interface ColumnActions {
  onDelete: (id: string) => void;
  onEdit: (coupon: Coupon) => void;
  onView: (coupon: Coupon) => void;
  onDuplicate: (coupon: Coupon) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
}

export const couponColumns = ({
  onDelete,
  onEdit,
  onView,
  onDuplicate,
  onToggleFeatured,
}: ColumnActions): ColumnDef<Coupon>[] => [
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
    accessorKey: "couponCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const couponCode = row.getValue("couponCode") as string;
      return <div className="font-mono text-sm font-medium">{couponCode}</div>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <Link to={`/admin/coupons/${coupon._id}`}>
          <div className="hover:text-primary font-medium transition-colors">
            {row.getValue("title")}
          </div>
          {coupon.canteenName && (
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <Ticket className="h-3 w-3" />
              <span>{coupon.canteenName}</span>
            </div>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "couponType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("couponType") as string;
      const typeConfig = {
        canteen: { label: "Canteen", color: "bg-blue-500" },
        cafeteria: { label: "Cafeteria", color: "bg-green-500" },
        meal: { label: "Meal", color: "bg-purple-500" },
        snack: { label: "Snack", color: "bg-orange-500" },
        beverage: { label: "Beverage", color: "bg-cyan-500" },
      };
      const config =
        typeConfig[type as keyof typeof typeConfig] || typeConfig.canteen;
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "discountType",
    header: "Discount",
    cell: ({ row }) => {
      const discountType = row.getValue("discountType") as string;
      const discountValue = row.original.discountValue;
      return (
        <div className="font-semibold text-green-600">
          {discountType === "percentage"
            ? `${discountValue}% OFF`
            : `$${discountValue} OFF`}
        </div>
      );
    },
  },
  {
    accessorKey: "pointsRequired",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const points = row.getValue("pointsRequired") as number;
      return (
        <div className="text-center">
          <Badge variant="secondary" className="font-semibold">
            {points} pts
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = {
        active: { label: "Active", color: "bg-green-500" },
        expired: { label: "Expired", color: "bg-gray-500" },
        used: { label: "Used", color: "bg-blue-500" },
        cancelled: { label: "Cancelled", color: "bg-red-500" },
      };
      const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.active;
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "totalRedemptions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          <Users className="mr-1 h-4 w-4" />
          Redemptions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const redemptions = row.getValue("totalRedemptions") as number;
      const totalQuantity = row.original.totalQuantity;
      const isUnlimited = row.original.isUnlimited;

      return (
        <div className="text-sm">
          <span className="font-semibold">{redemptions}</span>
          {!isUnlimited && totalQuantity && (
            <span className="text-muted-foreground text-xs">
              {" "}
              / {totalQuantity}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "validUntil",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          <Calendar className="mr-1 h-4 w-4" />
          Expires
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const validUntil = new Date(row.getValue("validUntil"));
      const isValid = validUntil > new Date();
      return (
        <div className="text-sm">
          <div className={!isValid ? "font-semibold text-red-600" : ""}>
            {format(validUntil, "MMM dd, yyyy")}
          </div>
          <div className="text-muted-foreground text-xs">
            {format(validUntil, "hh:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => {
      const isFeatured = row.getValue("isFeatured") as boolean;
      return isFeatured ? (
        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
      ) : (
        <Star className="h-5 w-5 text-gray-300" />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(coupon._id)}
              className="cursor-pointer"
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(coupon.couponCode)}
              className="cursor-pointer"
            >
              Copy Coupon Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onView(coupon)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(coupon)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate(coupon)}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleFeatured(coupon._id, !coupon.isFeatured)}
              className="cursor-pointer"
            >
              <Star className="mr-2 h-4 w-4" />
              {coupon.isFeatured ? "Remove Featured" : "Mark as Featured"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <DeleteConfirmation
                title="Are you sure?"
                description={`This will permanently delete "${coupon.title}". This action cannot be undone.${coupon.totalRedemptions > 0 ? "\n\nWarning: This coupon has been redeemed " + coupon.totalRedemptions + " times. Deleting it may affect existing redemptions." : ""}`}
                onConfirm={() => onDelete(coupon._id)}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
