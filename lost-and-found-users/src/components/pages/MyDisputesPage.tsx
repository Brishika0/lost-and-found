// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { useMyDisputes } from "@/hooks/useDisputes";
// import { formatDistanceToNow } from "date-fns";
// import {
//   MessageCircle,
//   Scale,
//   Eye,
//   Loader2,
//   AlertTriangle,
//   CheckCircle,
//   ArrowUpCircle,
//   FileText,
//   Clock,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import type {
//   Dispute,
//   DisputeStatus,
//   DisputeType,
//   Priority,
// } from "@/types/dispute.types";

// //  Status Configuration

// interface StatusConfigItem {
//   label: string;
//   color: string;
//   badgeColor: string;
//   icon: React.ComponentType<{ className?: string }>;
// }

// const statusConfig: Record<DisputeStatus, StatusConfigItem> = {
//   open: {
//     label: "Open",
//     color: "bg-red-100 text-red-700 border-red-200",
//     badgeColor: "bg-red-100 text-red-800",
//     icon: AlertTriangle,
//   },
//   under_review: {
//     label: "Under Review",
//     color: "bg-yellow-100 text-yellow-700 border-yellow-200",
//     badgeColor: "bg-yellow-100 text-yellow-800",
//     icon: Eye,
//   },
//   escalated: {
//     label: "Escalated",
//     color: "bg-orange-100 text-orange-700 border-orange-200",
//     badgeColor: "bg-orange-100 text-orange-800",
//     icon: ArrowUpCircle,
//   },
//   resolved: {
//     label: "Resolved",
//     color: "bg-green-100 text-green-700 border-green-200",
//     badgeColor: "bg-green-100 text-green-800",
//     icon: CheckCircle,
//   },
//   closed: {
//     label: "Closed",
//     color: "bg-gray-100 text-gray-700 border-gray-200",
//     badgeColor: "bg-gray-100 text-gray-800",
//     icon: FileText,
//   },
// };

// const priorityConfig: Record<Priority, { label: string; color: string }> = {
//   low: { label: "Low", color: "bg-gray-100 text-gray-700" },
//   medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
//   high: { label: "High", color: "bg-orange-100 text-orange-700" },
//   urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
// };

// const typeLabels: Record<DisputeType, string> = {
//   wrongful_claim: "Wrongful Claim",
//   item_damage: "Item Damage",
//   fake_item: "Fake Item",
//   harassment: "Harassment",
//   communication_issue: "Communication Issue",
//   other: "Other",
// };

// //  Dispute Card Component

// interface DisputeCardProps {
//   dispute: Dispute;
//   onViewDetails: () => void;
// }

// const DisputeCard = ({ dispute, onViewDetails }: DisputeCardProps) => {
//   const StatusIcon = statusConfig[dispute.status]?.icon || FileText;

//   return (
//     <Card
//       className="cursor-pointer transition-shadow hover:shadow-md"
//       onClick={onViewDetails}
//     >
//       <CardContent className="p-4">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <div className="mb-2 flex items-center gap-2">
//               <Badge className={statusConfig[dispute.status]?.badgeColor}>
//                 <StatusIcon className="mr-1 h-3 w-3" />
//                 {statusConfig[dispute.status]?.label}
//               </Badge>
//               <Badge className={priorityConfig[dispute.priority]?.color}>
//                 {priorityConfig[dispute.priority]?.label}
//               </Badge>
//             </div>

//             <h3 className="mb-1 text-lg font-semibold">{dispute.title}</h3>
//             <p className="mb-2 line-clamp-2 text-sm text-gray-600">
//               {dispute.description}
//             </p>

//             <div className="flex items-center gap-4 text-xs text-gray-500">
//               <div className="flex items-center gap-1">
//                 <FileText className="h-3 w-3" />
//                 <span>{typeLabels[dispute.type] || dispute.type}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Clock className="h-3 w-3" />
//                 <span>
//                   {formatDistanceToNow(new Date(dispute.createdAt))} ago
//                 </span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <MessageCircle className="h-3 w-3" />
//                 <span>{dispute.messages?.length || 0} messages</span>
//               </div>
//             </div>
//           </div>

//           <div className="ml-4 flex flex-col gap-2">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onViewDetails();
//               }}
//             >
//               <Eye className="mr-1 h-4 w-4" />
//               View
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// //  Loading Skeleton

// const DisputeSkeleton = () => (
//   <Card>
//     <CardContent className="p-4">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="mb-2 flex gap-2">
//             <Skeleton className="h-6 w-20" />
//             <Skeleton className="h-6 w-16" />
//           </div>
//           <Skeleton className="mb-2 h-6 w-3/4" />
//           <Skeleton className="mb-1 h-4 w-full" />
//           <Skeleton className="h-4 w-2/3" />
//           <div className="mt-2 flex gap-4">
//             <Skeleton className="h-4 w-24" />
//             <Skeleton className="h-4 w-24" />
//             <Skeleton className="h-4 w-24" />
//           </div>
//         </div>
//         <Skeleton className="h-16 w-16" />
//       </div>
//     </CardContent>
//   </Card>
// );

// //  Empty State

// const EmptyState = () => (
//   <div className="py-12 text-center">
//     <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 p-4">
//       <Scale className="h-10 w-10 text-gray-400" />
//     </div>
//     <h3 className="mb-2 text-lg font-semibold text-gray-900">
//       No Disputes Found
//     </h3>
//     <p className="mb-6 text-gray-500">
//       You haven't filed any disputes yet. If you encounter issues with items,
//       you can file a dispute from the item page.
//     </p>
//     <Button onClick={() => (window.location.href = "/feed")}>
//       Browse Items
//     </Button>
//   </div>
// );

// //  Main Page Component

// export default function MyDisputesPage() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [page, setPage] = useState(1);
//   const [status, setStatus] = useState<string>("");

//   const { data, isLoading, refetch } = useMyDisputes({
//     status: status || undefined,
//     page,
//     limit: 10,
//   });

//   const disputes: Dispute[] = data?.data?.disputes || [];
//   const pagination = data?.data?.pagination;

//   const handleViewDetails = (disputeId: string) => {
//     navigate(`/my-disputes/${disputeId}`);
//   };

//   const handleRefresh = () => {
//     refetch();
//   };

//   if (!user) {
//     return null;
//   }

//   const openDisputes = disputes.filter(
//     (d: Dispute) => d.status === "open",
//   ).length;
//   const underReviewDisputes = disputes.filter(
//     (d: Dispute) => d.status === "under_review",
//   ).length;
//   const resolvedDisputes = disputes.filter(
//     (d: Dispute) => d.status === "resolved",
//   ).length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="mx-auto max-w-4xl px-4 py-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
//             <Scale className="h-6 w-6 text-orange-600" />
//             My Disputes
//           </h1>
//           <p className="mt-1 text-gray-500">
//             Track and manage disputes you've filed
//           </p>
//         </div>

//         {/* Stats Cards */}
//         {!isLoading && disputes.length > 0 && (
//           <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
//             <Card>
//               <CardContent className="p-3">
//                 <p className="text-xs text-gray-500">Total Disputes</p>
//                 <p className="text-xl font-bold">{pagination?.total || 0}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-3">
//                 <p className="text-xs text-gray-500">Open</p>
//                 <p className="text-xl font-bold text-red-600">{openDisputes}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-3">
//                 <p className="text-xs text-gray-500">Under Review</p>
//                 <p className="text-xl font-bold text-yellow-600">
//                   {underReviewDisputes}
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-3">
//                 <p className="text-xs text-gray-500">Resolved</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {resolvedDisputes}
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {/* Status Filter */}
//         <div className="mb-4 flex flex-wrap gap-2">
//           <Button
//             variant={status === "" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("")}
//           >
//             All
//           </Button>
//           <Button
//             variant={status === "open" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("open")}
//             className={
//               status === "open"
//                 ? "bg-red-600"
//                 : "bg-red-50 text-red-600 hover:bg-red-100"
//             }
//           >
//             Open
//           </Button>
//           <Button
//             variant={status === "under_review" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("under_review")}
//             className={
//               status === "under_review"
//                 ? "bg-yellow-600"
//                 : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
//             }
//           >
//             Under Review
//           </Button>
//           <Button
//             variant={status === "escalated" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("escalated")}
//             className={
//               status === "escalated"
//                 ? "bg-orange-600"
//                 : "bg-orange-50 text-orange-600 hover:bg-orange-100"
//             }
//           >
//             Escalated
//           </Button>
//           <Button
//             variant={status === "resolved" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("resolved")}
//             className={
//               status === "resolved"
//                 ? "bg-green-600"
//                 : "bg-green-50 text-green-600 hover:bg-green-100"
//             }
//           >
//             Resolved
//           </Button>
//           <Button
//             variant={status === "closed" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setStatus("closed")}
//           >
//             Closed
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleRefresh}
//             className="ml-auto"
//           >
//             <Loader2 className="mr-1 h-4 w-4" />
//             Refresh
//           </Button>
//         </div>

//         {/* Disputes List */}
//         {isLoading ? (
//           <div className="space-y-3">
//             <DisputeSkeleton />
//             <DisputeSkeleton />
//             <DisputeSkeleton />
//           </div>
//         ) : disputes.length === 0 ? (
//           <EmptyState />
//         ) : (
//           <div className="space-y-3">
//             {disputes.map((dispute: Dispute) => (
//               <DisputeCard
//                 key={dispute._id}
//                 dispute={dispute}
//                 onViewDetails={() => handleViewDetails(dispute._id)}
//               />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {pagination && pagination.pages > 1 && (
//           <div className="mt-6 flex justify-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//             >
//               Previous
//             </Button>
//             <span className="flex items-center px-3 text-sm">
//               Page {page} of {pagination.pages}
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
//               disabled={page === pagination.pages}
//             >
//               Next
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyDisputes } from "@/hooks/useDisputes";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Scale,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  Dispute,
  DisputeStatus,
  DisputeType,
  Priority,
} from "@/types/dispute.types";

// Status Configuration
interface StatusConfigItem {
  label: string;
  color: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfig: Record<DisputeStatus, StatusConfigItem> = {
  open: {
    label: "Open",
    color: "bg-red-100 text-red-700 border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-800",
    icon: Eye,
  },
  escalated: {
    label: "Escalated",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    icon: ArrowUpCircle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-700 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    badgeColor: "bg-gray-100 text-gray-800",
    icon: FileText,
  },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const typeLabels: Record<DisputeType, string> = {
  wrongful_claim: "Wrongful Claim",
  item_damage: "Item Damage",
  fake_item: "Fake Item",
  harassment: "Harassment",
  communication_issue: "Communication Issue",
  other: "Other",
};

// Dispute Card Component
interface DisputeCardProps {
  dispute: Dispute;
  onViewDetails: () => void;
}

const DisputeCard = ({ dispute, onViewDetails }: DisputeCardProps) => {
  const StatusIcon = statusConfig[dispute.status]?.icon || FileText;

  return (
    <Card
      className="cursor-pointer border border-gray-100 p-2 transition-all hover:shadow-md"
      onClick={onViewDetails}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={statusConfig[dispute.status]?.badgeColor}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig[dispute.status]?.label}
              </Badge>
              <Badge className={priorityConfig[dispute.priority]?.color}>
                {priorityConfig[dispute.priority]?.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {typeLabels[dispute.type] || dispute.type}
              </Badge>
            </div>

            <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900">
              {dispute.title}
            </h3>
            <p className="mb-2 line-clamp-2 text-sm text-gray-600">
              {dispute.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(dispute.createdAt))} ago
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{dispute.messages?.length || 0} messages</span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-shrink-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) => (
  <Card className="border border-gray-100 p-0 shadow-sm">
    <CardContent className="p-3">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={cn("text-xl font-bold", color)}>{value}</p>
    </CardContent>
  </Card>
);

// Loading Skeleton
const DisputeSkeleton = () => (
  <Card className="border border-gray-100">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-1 h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-2 flex gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

// Empty State
const EmptyState = () => (
  <div className="py-12 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Scale className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-gray-900">
      No Disputes Found
    </h3>
    <p className="mb-6 text-sm text-gray-500">
      You haven't filed any disputes yet. If you encounter issues with items,
      you can file a dispute from the item page.
    </p>
    <Button
      onClick={() => (window.location.href = "/feed")}
      className="bg-blue-600 hover:bg-blue-700"
    >
      Browse Items
    </Button>
  </div>
);

// Main Page Component
export default function MyDisputesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch } = useMyDisputes({
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  const disputes: Dispute[] = data?.data?.disputes || [];
  const pagination = data?.data?.pagination;

  // Calculate stats from all disputes (not filtered)
  const allDisputes = disputes;
  const totalCount = pagination?.total || 0;
  const openCount = allDisputes.filter((d) => d.status === "open").length;
  const underReviewCount = allDisputes.filter(
    (d) => d.status === "under_review",
  ).length;
  const resolvedCount = allDisputes.filter(
    (d) => d.status === "resolved",
  ).length;

  const handleViewDetails = (disputeId: string) => {
    navigate(`/my-disputes/${disputeId}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (!user) {
    return null;
  }

  const filterButtons = [
    { key: "", label: "All", color: "default", bgClass: "" },
    {
      key: "open",
      label: "Open",
      color: "red",
      bgClass: "bg-red-600 hover:bg-red-700",
    },
    {
      key: "under_review",
      label: "Under Review",
      color: "yellow",
      bgClass: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      key: "escalated",
      label: "Escalated",
      color: "orange",
      bgClass: "bg-orange-600 hover:bg-orange-700",
    },
    {
      key: "resolved",
      label: "Resolved",
      color: "green",
      bgClass: "bg-green-600 hover:bg-green-700",
    },
    {
      key: "closed",
      label: "Closed",
      color: "gray",
      bgClass: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage disputes you've filed
          </p>
        </div>

        {/* Stats Cards - Always visible */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatsCard
            title="Total Disputes"
            value={totalCount}
            color="text-blue-600"
          />
          <StatsCard title="Open" value={openCount} color="text-red-600" />
          <StatsCard
            title="Under Review"
            value={underReviewCount}
            color="text-yellow-600"
          />
          <StatsCard
            title="Resolved"
            value={resolvedCount}
            color="text-green-600"
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {filterButtons.map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(filter.key)}
                className={
                  statusFilter === filter.key && filter.bgClass
                    ? filter.bgClass
                    : statusFilter === filter.key
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="gap-1"
          >
            <Loader2 className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        {/* Disputes List */}
        {isLoading ? (
          <div className="space-y-3">
            <DisputeSkeleton />
            <DisputeSkeleton />
            <DisputeSkeleton />
          </div>
        ) : disputes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <DisputeCard
                key={dispute._id}
                dispute={dispute}
                onViewDetails={() => handleViewDetails(dispute._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
