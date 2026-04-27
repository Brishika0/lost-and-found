import { useState } from "react";
import {
  useGetColleges,
  useDeleteCollege,
  useUpdateCollegeStatus,
} from "@/hooks/useColleges";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { collegeColumns } from "../../columns/collegesColumn";
import { DataTable } from "../../dataTables/dataTable";
import { Input } from "../../ui/input";
import { Link } from "react-router-dom";
import { useDebounce } from "@/utils/debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CollegesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, refetch } = useGetColleges({
    page,
    limit,
    search: debouncedSearch,
    isActive,
  });

  const deleteCollege = useDeleteCollege();
  const updateStatus = useUpdateCollegeStatus();

  const colleges = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const columns = collegeColumns({
    onDelete: (id: string) => {
      deleteCollege.mutateAsync(id);
    },
    onToggleStatus: (id: string, isActive: boolean) => {
      updateStatus.mutate({
        id,
        isActive,
      });
    },
  });

  // Toolbar
  const toolbar = () => {
    return (
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <Input
          placeholder="Search college..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {/* Status Filter */}
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button variant="outline" onClick={() => refetch()} size="sm">
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
          <h1 className="text-3xl font-bold tracking-tight">Colleges</h1>
          <p className="text-muted-foreground">
            Manage colleges and their settings
          </p>
        </div>
        <Link to="/colleges/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add College
          </Button>
        </Link>
      </div>

      <DataTable
        data={colleges}
        columns={columns}
        totalCount={pagination.total}
        pageCount={pagination.pages}
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
