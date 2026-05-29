// pages/admin/LostItemsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLostItems,
  useVerifyItem,
  useDeleteItem,
  usePermanentDeleteItem,
  useResolveFlags,
} from "@/hooks/useLostItems";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lostItemColumns } from "../../columns/lostItemColumns";
import { DataTable } from "../../dataTables/dataTable";
import { Button } from "../../ui/button";
import { Plus, RefreshCw } from "lucide-react";
import type { LostItem } from "@/types/lostItem.types";
import { useDebounce } from "@/utils/debounce";
import { useAuth } from "@/contexts/AuthContext";

export default function LostItemsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const collegeId = user?.college?.id;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, refetch } = useLostItems({
    collegeId: collegeId || "",
    page,
    limit,
    search: debouncedSearch,
    status: status !== "all" ? (status as any) : undefined,
    category: category !== "all" ? category : undefined,

    isVerified,
    isActive,
  });

  const verifyMutation = useVerifyItem();
  const deleteMutation = useDeleteItem();
  const permanentDeleteMutation = usePermanentDeleteItem();
  const resolveFlagsMutation = useResolveFlags();

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleView = (item: LostItem) => {
    navigate(`/admin/lost-items/${item._id}`);
  };

  const handleEdit = (item: LostItem) => {
    navigate(`/admin/lost-items/edit/${item._id}`);
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to verify item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await permanentDeleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to permanently delete item:", error);
    }
  };

  const handleResolveFlags = async (id: string, action: "keep" | "remove") => {
    try {
      await resolveFlagsMutation.mutateAsync({ id, data: { action } });
      refetch();
    } catch (error) {
      console.error("Failed to resolve flags:", error);
    }
  };

  const columns = lostItemColumns({
    onView: handleView,
    onEdit: handleEdit,
    onVerify: handleVerify,
    onDelete: handleDelete,
    onPermanentDelete: handlePermanentDelete,
    onResolveFlags: handleResolveFlags,
  });

  // Toolbar
  const toolbar = () => {
    return (
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <Input
          placeholder="Search by item name, description, tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Books">Books</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
            <SelectItem value="Documents">Documents</SelectItem>
            <SelectItem value="Keys">Keys</SelectItem>
            <SelectItem value="Wallets">Wallets</SelectItem>
            <SelectItem value="Bags">Bags</SelectItem>
            <SelectItem value="Mobile Phones">Mobile Phones</SelectItem>
            <SelectItem value="Laptops">Laptops</SelectItem>
            <SelectItem value="ID Cards">ID Cards</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Verification Filter */}
        <Select
          value={
            isVerified === undefined
              ? "all"
              : isVerified
                ? "verified"
                : "unverified"
          }
          onValueChange={(value) => {
            if (value === "all") setIsVerified(undefined);
            if (value === "verified") setIsVerified(true);
            if (value === "unverified") setIsVerified(false);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Both States</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Status Filter */}
        <Select
          value={
            isActive === undefined ? "all" : isActive ? "active" : "inactive"
          }
          onValueChange={(value) => {
            if (value === "all") setIsActive(undefined);
            if (value === "active") setIsActive(true);
            if (value === "inactive") setIsActive(false);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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

  return (
    <div className="mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lost & Found Items
          </h1>
          <p className="text-muted-foreground">
            Manage all lost and found items reported in your college
          </p>
        </div>
        <Button
          onClick={() => navigate("/lost-items/create")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Report Item
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={items}
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
    </div>
  );
}
