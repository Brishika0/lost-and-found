import { useState } from "react";
import {
  useAllCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useCollegeCouponStats,
} from "@/hooks/useCoupon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { couponColumns } from "@/components/columns/couponColumns";
import { DataTable } from "@/components/dataTables/dataTable";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Plus,
  AlertCircle,
  Gift,
  TrendingUp,
  Building2,
  Filter,
  Download,
  Trash2,
  CheckCircle,
} from "lucide-react";
import type { Coupon, CouponFilters } from "@/types/coupon.types";
import { useDebounce } from "@/utils/debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CreateCouponDialog } from "@/components/dialogs/CreateCouponDialog";
import { EditCouponDialog } from "@/components/dialogs/EditCouponDialog";
import { ViewCouponDialog } from "@/components/dialogs/ViewCouponDialog";
import { useGetColleges } from "@/hooks/useColleges";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [couponType, setCouponType] = useState<string>("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  // Get colleges for filter (super admin only)
  const { data: collegesData } = useGetColleges({
    page: 1,
    limit: 100,
  });

  // Build filters
  const filters: CouponFilters = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (status) filters.status = status as any;
  if (couponType) filters.couponType = couponType as any;
  if (selectedCollegeId) filters.collegeId = selectedCollegeId;
  if (debouncedSearch) {
    // filters.search = debouncedSearch;
  }

  // Queries
  const { data: coupons = [], isLoading, refetch } = useAllCoupons(filters);
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useCollegeCouponStats(selectedCollegeId || undefined);

  // Mutations
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const stats = statsData;

  // Handlers
  const handleView = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setViewDialogOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon.mutateAsync(id);
    refetch();
    refetchStats();
  };

  const handleDuplicate = async (coupon: Coupon) => {
    const {
      _id,
      couponCode,
      createdAt,
      updatedAt,
      totalRedemptions,
      totalPointsRedeemed,
      collegeId,
      ...duplicateData
    } = coupon;
    await createCoupon.mutateAsync({
      ...duplicateData,
      title: `${coupon.title} (Copy)`,
      collegeId: typeof collegeId === "string" ? collegeId : collegeId._id,
      validFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      validUntil: format(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd'T'HH:mm",
      ),
    });
    refetch();
    refetchStats();
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    await updateCoupon.mutateAsync({
      couponId: id,
      data: { isFeatured },
    });
    refetch();
  };

  // Bulk actions for super admin
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (
      confirm(`Are you sure you want to delete ${selectedRows.length} coupons?`)
    ) {
      for (const id of selectedRows) {
        await deleteCoupon.mutateAsync(id);
      }
      setSelectedRows([]);
      refetch();
      refetchStats();
    }
  };

  const handleBulkStatusUpdate = async (
    status: "active" | "expired" | "cancelled",
  ) => {
    if (selectedRows.length === 0) return;
    if (confirm(`Update ${selectedRows.length} coupons to ${status}?`)) {
      for (const id of selectedRows) {
        await updateCoupon.mutateAsync({ couponId: id, data: { status } });
      }
      setSelectedRows([]);
      refetch();
      refetchStats();
    }
  };

  const handleExportToExcel = () => {
    const exportData = coupons.map((coupon) => ({
      "Coupon Code": coupon.couponCode,
      Title: coupon.title,
      Type: coupon.couponType,
      "Discount Type": coupon.discountType,
      "Discount Value": coupon.discountValue,
      "Points Required": coupon.pointsRequired,
      "Original Value": coupon.originalValue,
      Status: coupon.status,
      "Total Redemptions": coupon.totalRedemptions,
      College:
        typeof coupon.collegeId === "string"
          ? coupon.collegeId
          : coupon.collegeId.name,
      "Valid From": format(new Date(coupon.validFrom), "PPP"),
      "Valid Until": format(new Date(coupon.validUntil), "PPP"),
      "Created At": format(new Date(coupon.createdAt), "PPP"),
      Featured: coupon.isFeatured ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coupons");
    XLSX.writeFile(
      wb,
      `coupons_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    );
  };

  const columns = couponColumns({
    onDelete: handleDelete,
    onEdit: handleEdit,
    onView: handleView,
    onDuplicate: handleDuplicate,
    onToggleFeatured: handleToggleFeatured,
  });

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCouponType("");
    setSelectedCollegeId("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  // Toolbar Component with super admin filters
  const toolbar = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <Input
            placeholder="Search coupons by title or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />

          {/* College Filter (Super Admin) */}
          <Select
            value={selectedCollegeId || "all"}
            onValueChange={(value) => {
              setSelectedCollegeId(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by College" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {collegesData?.data?.map((college: any) => (
                <SelectItem key={college._id} value={college._id}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Coupon Type Filter */}
          <Select
            value={couponType || "all"}
            onValueChange={(value) => {
              setCouponType(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Coupon Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="canteen">Canteen</SelectItem>
              <SelectItem value="cafeteria">Cafeteria</SelectItem>
              <SelectItem value="meal">Meal</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="pointsRequired">Points</SelectItem>
              <SelectItem value="totalRedemptions">Redemptions</SelectItem>
              <SelectItem value="validUntil">Expiry Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sortOrder}
            onValueChange={(value: "asc" | "desc") => {
              setSortOrder(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(search || status || couponType || selectedCollegeId) && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}

          {/* Refresh Button */}
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Export Button */}
          <Button variant="outline" onClick={handleExportToExcel} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* Create Button */}
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Input
            type="date"
            placeholder="From Date"
            value={dateRange.from}
            onChange={(e) => {
              setDateRange({ ...dateRange, from: e.target.value });
              setPage(1);
            }}
            className="w-[150px]"
          />
          <Input
            type="date"
            placeholder="To Date"
            value={dateRange.to}
            onChange={(e) => {
              setDateRange({ ...dateRange, to: e.target.value });
              setPage(1);
            }}
            className="w-[150px]"
          />
        </div>

        {/* Bulk Actions (Super Admin) */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2">
            <span className="text-sm font-medium">
              {selectedRows.length} coupon(s) selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("active")}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Set as Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("expired")}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                  Set as Expired
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("cancelled")}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  Set as Cancelled
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleBulkDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Stats Cards for Super Admin
  const statsCards = () => {
    if (statsLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const activeStats = stats?.stats?.find((s) => s._id === "active");
    const expiredStats = stats?.stats?.find((s) => s._id === "expired");
    const cancelledStats = stats?.stats?.find((s) => s._id === "cancelled");

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="gap-0 space-y-0 border-l-4 border-l-blue-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4" />
              Total Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.stats?.reduce((sum, s) => sum + s.count, 0) || 0}
            </div>
            <p className="text-muted-foreground text-xs">across all colleges</p>
          </CardContent>
        </Card>

        <Card className="gap-0 space-y-0 border-l-4 border-l-green-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-2xl font-bold text-green-600">
              {activeStats?.count || 0}
            </div>
            {activeStats && activeStats.count > 0 && (
              <div className="text-muted-foreground mt-1 text-xs">
                {activeStats.totalRedemptions} redemptions
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 space-y-0 border-l-4 border-l-gray-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-2xl font-bold text-gray-500">
              {expiredStats?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 space-y-0 border-l-4 border-l-red-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-2xl font-bold text-red-500">
              {cancelledStats?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 space-y-0 border-l-4 border-l-purple-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Total Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-2xl font-bold">
              {stats?.stats?.reduce((sum, s) => sum + s.totalRedemptions, 0) ||
                0}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 space-y-0 border-l-4 border-l-orange-500 p-0">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Points Redeemed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-2xl font-bold">
              {stats?.stats
                ?.reduce((sum, s) => sum + s.totalPointsRedeemed, 0)
                .toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Expiring Soon Alert
  const expiringSoonCoupons = coupons.filter((coupon) => {
    const validUntil = new Date(coupon.validUntil);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (
      coupon.status === "active" && daysUntilExpiry <= 7 && daysUntilExpiry > 0
    );
  });

  // Low Stock Alert
  const lowStockCoupons = coupons.filter((coupon) => {
    if (coupon.isUnlimited) return false;
    const remainingPercentage =
      (coupon.remainingQuantity || 0) / (coupon.totalQuantity || 1);
    return remainingPercentage <= 0.2 && (coupon.remainingQuantity || 0) > 0;
  });

  return (
    <div className="mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coupons Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage canteen/cafeteria coupons for students to redeem
            with their points
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Building2 className="mr-1 h-3 w-3" />
          {selectedCollegeId && collegesData?.data
            ? collegesData.data.find((c: any) => c._id === selectedCollegeId)
                ?.name
            : "All Colleges"}
        </Badge>
      </div>

      {/* Alerts */}
      {(expiringSoonCoupons.length > 0 || lowStockCoupons.length > 0) && (
        <div className="space-y-2">
          {expiringSoonCoupons.length > 0 && (
            <Alert variant="default" className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">
                Coupons Expiring Soon
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                {expiringSoonCoupons.length} coupon
                {expiringSoonCoupons.length !== 1 ? "s are" : " is"} expiring
                within 7 days. Please review and consider extending the validity
                or promoting them.
              </AlertDescription>
            </Alert>
          )}

          {lowStockCoupons.length > 0 && (
            <Alert variant="default" className="border-orange-500 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">
                Low Stock Alert
              </AlertTitle>
              <AlertDescription className="text-orange-700">
                {lowStockCoupons.length} coupon
                {lowStockCoupons.length !== 1 ? "s have" : " has"} less than 20%
                stock remaining. Consider restocking or creating new coupons.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Stats Cards */}
      {statsCards()}

      {/* Tabs for Different Views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="lowStock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DataTable
            data={coupons}
            columns={columns}
            totalCount={coupons.length}
            pageCount={Math.ceil(coupons.length / limit)}
            currentPage={page}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
            isLoading={isLoading}
            toolbar={toolbar()}
            enableRowSelection={true}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <DataTable
            data={coupons.filter((c) => c.status === "active")}
            columns={columns}
            totalCount={coupons.filter((c) => c.status === "active").length}
            pageCount={1}
            currentPage={1}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => setLimit(size)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <DataTable
            data={expiringSoonCoupons}
            columns={columns}
            totalCount={expiringSoonCoupons.length}
            pageCount={1}
            currentPage={1}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => setLimit(size)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="popular" className="mt-4">
          <DataTable
            data={[...coupons]
              .sort((a, b) => b.totalRedemptions - a.totalRedemptions)
              .slice(0, 10)}
            columns={columns}
            totalCount={Math.min(coupons.length, 10)}
            pageCount={1}
            currentPage={1}
            pageSize={10}
            onPageChange={setPage}
            onPageSizeChange={(size) => setLimit(size)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="lowStock" className="mt-4">
          <DataTable
            data={lowStockCoupons}
            columns={columns}
            totalCount={lowStockCoupons.length}
            pageCount={1}
            currentPage={1}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => setLimit(size)}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateCouponDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
          refetchStats();
        }}
      />

      <EditCouponDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        coupon={selectedCoupon}
        onSuccess={() => {
          setEditDialogOpen(false);
          refetch();
          refetchStats();
        }}
      />

      <ViewCouponDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        coupon={selectedCoupon}
      />
    </div>
  );
}
