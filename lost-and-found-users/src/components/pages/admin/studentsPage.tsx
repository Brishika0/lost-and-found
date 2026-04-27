import { useState } from "react";
import {
  useToggleUserStatus,
  useDeleteUser,
  useUpdateUser,
  useCreateUser,
  useVerifyUserEmail,
  useResendVerification,
  useGetStudents,
} from "@/hooks/useUsers";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userColumns } from "../../columns/userColumns";
import { DataTable } from "../../dataTables/dataTable";
import { useGetColleges } from "@/hooks/useColleges";
import type { College } from "@/types/college";
import { UserFormDialog } from "../../dialogs/userFromDialog";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import type { User } from "@/types/user.types";
import { useDebounce } from "@/utils/debounce";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from "@/schema/user.schema";

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | undefined>(
    undefined,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: collegesData, isLoading: isCollegeLoading } = useGetColleges({
    page: 1,
    limit: 100,
  });

  const { data, isLoading, refetch } = useGetStudents({
    page,
    limit,
    search: debouncedSearch,
    isActive,
    isEmailVerified,
  });

  const collegesList = collegesData?.data ?? [];

  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const verifyEmail = useVerifyUserEmail();
  const resendVerification = useResendVerification();

  const admins = data?.data ?? [];
  const pagination = data?.pagination;

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleVerifyEmail = async (id: string) => {
    try {
      await verifyEmail.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to verify email:", error);
    }
  };

  const handleResendVerification = async (id: string, email: string) => {
    try {
      await resendVerification.mutateAsync(id);
    } catch (error) {
      console.error("Failed to resend verification:", error);
    }
  };

  const columns = userColumns({
    onEdit: handleEdit,
    onToggleStatus: (id) => {
      toggleStatus.mutate(id);
    },
    onDelete: (id) => {
      deleteUser.mutate(id);
    },
    onVerifyEmail: handleVerifyEmail,
    onResendVerification: handleResendVerification,
  });

  // Toolbar
  const toolbar = () => {
    return (
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <Input
          placeholder="Search users..."
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

        {/* Email Verification Filter */}
        <Select
          value={
            isEmailVerified === undefined
              ? "all"
              : isEmailVerified
                ? "verified"
                : "unverified"
          }
          onValueChange={(value) => {
            if (value === "all") setIsEmailVerified(undefined);
            if (value === "verified") setIsEmailVerified(true);
            if (value === "unverified") setIsEmailVerified(false);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Email Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Email</SelectItem>
            <SelectItem value="verified">Verified Email</SelectItem>
            <SelectItem value="unverified">Unverified Email</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button variant="outline" onClick={() => refetch()} size="sm">
          Refresh
        </Button>
      </div>
    );
  };

  const handleFormSubmit = async (
    data: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    if (selectedUser) {
      // Update mode
      await updateUser.mutateAsync({
        id: selectedUser._id,
        data: data as UpdateUserFormValues,
      });
    } else {
      // Create mode
      await createUser.mutateAsync(data as CreateUserFormValues);
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users/students and their settings
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Uers</p>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.stats?.activeCount || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {data?.stats?.inactiveCount || 0}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Unverified</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data?.stats?.unverifiedCount || 0}
          </p>
        </div>
      </div>

      <DataTable
        data={admins}
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

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
