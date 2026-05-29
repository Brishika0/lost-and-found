import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetZones, useDeleteZone, useUpdateZone } from "@/hooks/useZones";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building, Layers, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ZONE_TYPE_OPTIONS,
  type Zone,
  type ZoneType,
} from "@/types/zone.types";
import { zoneColumns } from "../../columns/zonesColumn";
import { ZoneFormDialog } from "../../dialogs/zoneFormDialog";
import { DataTable } from "../../dataTables/dataTable";
import { useDebounce } from "@/utils/debounce";

export default function ZonesPage() {
  const { user } = useAuth();
  const isCollegeAdmin = user?.role === "college_admin";

  // State for pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ZoneType | "all">("all");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [indoorStatus, setIndoorStatus] = useState<
    "indoor" | "outdoor" | "all"
  >("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  // Build query params
  const queryParams: any = {
    page,
    limit,
    search: debouncedSearch,
    type: type !== "all" ? type : undefined,
    isActive:
      status === "active" ? true : status === "inactive" ? false : undefined,
  };

  const { data, isLoading, refetch } = useGetZones(queryParams);
  const deleteZone = useDeleteZone();
  const updateZone = useUpdateZone();

  const zones = data?.data ?? [];
  const pagination = data?.pagination;

  // Calculate stats based on current filter
  const totalZones = pagination?.total || 0;
  const activeZones = zones.filter((zone) => zone.isActive).length;
  const inactiveZones = zones.filter((zone) => !zone.isActive).length;
  const indoorZones = zones.filter((zone) => zone.isIndoor).length;
  const outdoorZones = zones.filter((zone) => !zone.isIndoor).length;

  // Group zones by type for stats
  const typeStats = zones.reduce(
    (acc, zone) => {
      const type = zone.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleDelete = async (id: string) => {
    await deleteZone.mutateAsync({ id });
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await updateZone.mutateAsync({ id, data: { isActive } });
    refetch();
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setIsCreateDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setEditingZone(null);
    refetch();
  };

  const columns = zoneColumns({
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    onEdit: handleEdit,
  });

  // Toolbar Component
  const toolbar = () => {
    return (
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <Input
          placeholder="Search zones by name, building, or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {/* Zone Type Filter */}
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value as ZoneType | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="library">📚 Library</SelectItem>
            <SelectItem value="cafeteria">🍽️ Cafeteria</SelectItem>
            <SelectItem value="lab">🔬 Laboratory</SelectItem>
            <SelectItem value="classroom">🏫 Classroom</SelectItem>
            <SelectItem value="hostel">🏠 Hostel</SelectItem>
            <SelectItem value="sports">⚽ Sports Complex</SelectItem>
            <SelectItem value="parking">🅿️ Parking Area</SelectItem>
            <SelectItem value="walkway">🚶 Walkway</SelectItem>
            <SelectItem value="entrance">🚪 Entrance</SelectItem>
            <SelectItem value="other">📍 Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as "active" | "inactive" | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Indoor/Outdoor Filter */}
        <Select
          value={indoorStatus}
          onValueChange={(value) => {
            setIndoorStatus(value as "indoor" | "outdoor" | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Indoor/Outdoor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="indoor">🏢 Indoor</SelectItem>
            <SelectItem value="outdoor">🌳 Outdoor</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  };

  // Redirect or show access denied if not admin
  if (!isCollegeAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Access denied. Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Zones</h1>
          <p className="text-muted-foreground mt-1">
            {isCollegeAdmin
              ? "Manage campus zones across all colleges"
              : "Manage campus zones for your college"}
          </p>
        </div>
        {isCollegeAdmin && (
          <Button
            onClick={() => {
              setEditingZone(null);
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Zone
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            Total Zones
          </p>
          <p className="text-2xl font-bold">{totalZones}</p>
          {isCollegeAdmin && (
            <p className="text-muted-foreground mt-1 text-xs">
              {user.college?.name}
            </p>
          )}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Active
          </p>
          <p className="text-2xl font-bold text-green-600">{activeZones}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {totalZones > 0 ? Math.round((activeZones / totalZones) * 100) : 0}%
            of total
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            Inactive
          </p>
          <p className="text-2xl font-bold text-red-600">{inactiveZones}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {totalZones > 0
              ? Math.round((inactiveZones / totalZones) * 100)
              : 0}
            % of total
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <Building className="h-4 w-4" />
            Indoor / Outdoor
          </p>
          <p className="text-2xl font-bold">
            {indoorZones} / {outdoorZones}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {indoorZones + outdoorZones > 0
              ? Math.round((indoorZones / (indoorZones + outdoorZones)) * 100)
              : 0}
            % indoor
          </p>
        </div>
      </div>

      {/* Zone Type Distribution */}
      {Object.keys(typeStats).length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
            <Layers className="h-4 w-4" />
            Zone Type Distribution
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeStats).map(([typeName, count]) => {
              const typeOption = ZONE_TYPE_OPTIONS.find(
                (opt) => opt.value === typeName,
              );
              return (
                <Badge
                  key={typeName}
                  variant="secondary"
                  className="px-3 py-1.5"
                >
                  {typeOption?.icon || "📍"} {typeOption?.label || typeName}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({count})
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={zones}
        columns={columns}
        totalCount={pagination?.total ?? 0}
        pageCount={pagination?.pages ?? 1}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        isLoading={isLoading}
        toolbar={toolbar()}
      />

      {/* Create/Edit Zone Dialog */}
      {isCollegeAdmin && (
        <ZoneFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          zone={editingZone}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
