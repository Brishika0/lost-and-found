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
  Power,
  MapPin,
  Building,
  Layers,
} from "lucide-react";
import type { Zone } from "@/types/zone.types";
import { format } from "date-fns";
import { DeleteConfirmation } from "@/components/dialogs/deleteConfirmationDialog";
import { Link } from "react-router-dom";
import { ZONE_TYPE_OPTIONS } from "@/types/zone.types";

interface ColumnActions {
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onEdit: (zone: Zone) => void;
}

export const zoneColumns = ({
  onDelete,
  onToggleStatus,
  onEdit,
}: ColumnActions): ColumnDef<Zone>[] => [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as Zone["type"];
      const typeOption = ZONE_TYPE_OPTIONS.find((opt) => opt.value === type);
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeOption?.icon || "📍"}</span>
          <span className="text-sm">{typeOption?.label || type}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Zone Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link to={`/admin/zones/${row.original._id}`}>
        <div className="font-medium">{row.getValue("name")}</div>
        {row.original.building && (
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <Building className="h-3 w-3" />
            <span>{row.original.building}</span>
            {row.original.floor !== undefined && (
              <span>• Floor {row.original.floor}</span>
            )}
          </div>
        )}
      </Link>
    ),
  },
  {
    accessorKey: "collegeId",
    header: "College",
    cell: ({ row }) => {
      const college = row.original.collegeId;
      return (
        <div className="text-sm">
          <div className="font-medium">{college.name}</div>
          <div className="text-xs text-gray-500">{college.shortName}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return (
        <div className="text-sm">
          {location.address ? (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="max-w-[200px] truncate">{location.address}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">No address set</div>
          )}
          <div className="mt-0.5 font-mono text-xs text-gray-400">
            {location.coordinates[1].toFixed(4)}°,{" "}
            {location.coordinates[0].toFixed(4)}°
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "roomNumbers",
    header: "Rooms",
    cell: ({ row }) => {
      const roomNumbers = row.original.roomNumbers;
      if (!roomNumbers || roomNumbers.length === 0) {
        return <span className="text-sm text-gray-400">—</span>;
      }
      const displayRooms = roomNumbers.slice(0, 3);
      const remaining = roomNumbers.length - 3;
      return (
        <div className="flex flex-wrap items-center gap-1">
          {displayRooms.map((room) => (
            <Badge key={room} variant="outline" className="px-1.5 py-0 text-xs">
              {room}
            </Badge>
          ))}
          {remaining > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
              +{remaining}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isIndoor",
    header: "Type",
    cell: ({ row }) => {
      const isIndoor = row.getValue("isIndoor") as boolean;
      return (
        <Badge variant={isIndoor ? "default" : "outline"} className="text-xs">
          <div className="flex items-center gap-1">
            {isIndoor ? (
              <>
                <Building className="h-3 w-3" />
                <span>Indoor</span>
              </>
            ) : (
              <>
                <Layers className="h-3 w-3" />
                <span>Outdoor</span>
              </>
            )}
          </div>
        </Badge>
      );
    },
  },
  {
    accessorKey: "parentZoneId",
    header: "Parent Zone",
    cell: ({ row }) => {
      const parentZone = row.original.parentZoneId;
      if (!parentZone) {
        return <span className="text-sm text-gray-400">Top-level</span>;
      }
      return (
        <div className="text-sm">
          <div className="font-medium">{parentZone.name}</div>
          <div className="text-xs text-gray-500">{parentZone.type}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant={isActive ? "success" : "destructive"}
          className="capitalize"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          <span>{format(date, "dd/MM/yyyy")}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const zone = row.original;

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
              onClick={() => navigator.clipboard.writeText(zone._id)}
              className="cursor-pointer"
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const location = `${zone.location.coordinates[1]},${zone.location.coordinates[0]}`;
                navigator.clipboard.writeText(location);
              }}
              className="cursor-pointer"
            >
              Copy Coordinates
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(zone)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleStatus(zone._id, !zone.isActive)}
              className="cursor-pointer"
            >
              <Power className="mr-2 h-4 w-4" />
              {zone.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <DeleteConfirmation
                title="Are you sure?"
                description={`This will permanently delete "${zone.name}". This action cannot be undone.`}
                onConfirm={() => onDelete(zone._id)}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
