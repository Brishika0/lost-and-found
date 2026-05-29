import { useState } from "react";
import {
  useDisputes,
  useUpdateDisputeStatus,
  useArchiveDispute,
  useDisputeStatistics,
} from "@/hooks/useDisputes";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { disputeColumns } from "@/components/columns/disputeColumns";
import { DataTable } from "@/components/dataTables/dataTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import type { Dispute } from "@/types/dispute.types";
import { AddMessageDialog } from "@/components/dialogs/disputes/AddMessageDialog";
import { ResolveDisputeDialog } from "@/components/dialogs/disputes/ResolveDisputeDialog";
import { EscalateDisputeDialog } from "@/components/dialogs/disputes/EscalateDisputeDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DisputesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Dialog states
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Queries
  const { data, isLoading, refetch } = useDisputes({
    page,
    limit,
    status,
    type,
    priority,
    fromDate,
    toDate,
  });

  const { data: statsData, isLoading: statsLoading } = useDisputeStatistics();

  // Mutations
  const updateStatus = useUpdateDisputeStatus();
  const archiveDispute = useArchiveDispute();

  const disputes = data?.data?.disputes ?? [];
  const pagination = data?.data?.pagination;
  const stats = statsData?.data;

  // Handlers
  const handleView = (dispute: Dispute) => {
    setSelectedDispute(dispute);
  };

  const handleAddMessage = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setMessageDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await updateStatus.mutateAsync({
      id,
      data: { status: newStatus as any },
    });
  };

  const handleResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolveDialogOpen(true);
  };

  const handleEscalate = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setEscalateDialogOpen(true);
  };

  const handleAssignAdmin = (dispute: Dispute) => {
    setSelectedDispute(dispute);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this dispute?")) {
      await archiveDispute.mutateAsync(id);
    }
  };

  const columns = disputeColumns({
    onView: handleView,
    onAddMessage: handleAddMessage,
    onUpdateStatus: handleUpdateStatus,
    onResolve: handleResolve,
    onEscalate: handleEscalate,
    onAssignAdmin: handleAssignAdmin,
    onArchive: handleArchive,
  });

  // Toolbar Component
  const toolbar = () => {
    return (
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <Input
          placeholder="Search disputes by title or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={type || "all"}
          onValueChange={(value) => {
            setType(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wrongful_claim">Wrongful Claim</SelectItem>
            <SelectItem value="item_damage">Item Damage</SelectItem>
            <SelectItem value="fake_item">Fake Item</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="communication_issue">
              Communication Issue
            </SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={priority || "all"}
          onValueChange={(value) => {
            setPriority(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filters */}
        <Input
          type="date"
          placeholder="From Date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          className="w-[150px]"
        />
        <Input
          type="date"
          placeholder="To Date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          className="w-[150px]"
        />

        {/* Refresh Button */}
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  };

  // Stats Cards
  const statsCards = () => {
    if (statsLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

    return (
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCounts.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.totalCounts.open || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalCounts.underReview || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.totalCounts.escalated || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalCounts.resolved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Avg. Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.resolutionTime?.averageHours?.toFixed(1) || "N/A"}
            </div>
            <div className="text-muted-foreground text-xs">hours</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // High Priority Alert
  const highPriorityDisputes = disputes.filter(
    (d) =>
      d.priority === "urgent" &&
      d.status !== "resolved" &&
      d.status !== "closed",
  );

  return (
    <div className="mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
          <p className="text-muted-foreground">
            Manage and resolve disputes reported by users
          </p>
        </div>
      </div>

      {/* High Priority Alert */}
      {highPriorityDisputes.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Urgent Attention Required</AlertTitle>
          <AlertDescription>
            There {highPriorityDisputes.length === 1 ? "is" : "are"}{" "}
            {highPriorityDisputes.length} urgent dispute
            {highPriorityDisputes.length !== 1 ? "s" : ""} that require
            immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {statsCards()}

      {/* Data Table */}
      <DataTable
        data={disputes}
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

      <AddMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        dispute={selectedDispute}
        onSuccess={() => {
          setMessageDialogOpen(false);
          refetch();
        }}
      />

      <ResolveDisputeDialog
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
        dispute={selectedDispute}
        onSuccess={() => {
          setResolveDialogOpen(false);
          refetch();
        }}
      />

      <EscalateDisputeDialog
        open={escalateDialogOpen}
        onOpenChange={setEscalateDialogOpen}
        dispute={selectedDispute}
        onSuccess={() => {
          setEscalateDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
