import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyLostItems } from "@/hooks/useLostItems";
import { formatNumber } from "@/utils/formatUtils";
import {
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/components/posts/postCard";
import { Navbar } from "@/components/navbar";
import type { ItemStatus } from "@/types/lostItem.types";

// Post Skeleton
const PostSkeleton = () => (
  <div className="animate-pulse">
    <div className="mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-3">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="mt-4 h-[300px] w-full rounded-xl" />
    </div>
  </div>
);

// Empty State
const EmptyState = ({ statusFilter }: { statusFilter: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-gray-100 bg-white py-16 text-center"
  >
    <div className="mb-4 text-7xl">📭</div>
    <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
    <p className="mt-1 text-gray-500">
      {statusFilter !== "all"
        ? `You don't have any ${statusFilter} items yet.`
        : "You haven't posted any items yet."}
    </p>
    <Button
      onClick={() => (window.location.href = "/create-post")}
      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all hover:shadow-xl"
    >
      Create Your First Post
    </Button>
  </motion.div>
);

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 p-0 shadow-md transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold", color)}>
              {formatNumber(value)}
            </p>
          </div>
          <div
            className={cn(
              "rounded-full p-2",
              color === "text-blue-600"
                ? "bg-blue-100"
                : color === "text-red-500"
                  ? "bg-red-100"
                  : color === "text-green-500"
                    ? "bg-green-100"
                    : "bg-purple-100",
            )}
          >
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// MAIN COMPONENT
export default function MyItemsPage() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Sticky navbar detection
  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        const offset = navbarRef.current.offsetTop;
        setIsSticky(window.scrollY > offset);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data, isLoading, isFetching, refetch } = useMyLostItems({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  // Calculate stats
  const totalCount = pagination?.total || 0;
  const lostCount = items.filter((i) => i.status === "lost").length;
  const foundCount = items.filter((i) => i.status === "found").length;
  const claimedCount = items.filter((i) => i.status === "claimed").length;
  const returnedCount = items.filter((i) => i.status === "returned").length;

  const statusTabs = [
    { value: "all", label: "All", count: totalCount, color: "default" },
    { value: "lost", label: "Lost", count: lostCount, color: "red" },
    { value: "found", label: "Found", count: foundCount, color: "green" },
    { value: "claimed", label: "Claimed", count: claimedCount, color: "blue" },
    {
      value: "returned",
      label: "Returned",
      count: returnedCount,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Sticky Navigation Bar */}
      <div
        ref={navbarRef}
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isSticky
            ? "border-b border-gray-100 bg-white/95 shadow-lg backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="bg-white p-4 shadow-xl">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute top-1/2 left-4 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search your items by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-gray-200 bg-gray-50 py-6 pr-10 pl-10 transition-all focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-4 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Status Tabs */}
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setStatusFilter(tab.value as any);
                      setPage(1);
                    }}
                    className={cn(
                      "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                      statusFilter === tab.value
                        ? tab.color === "red"
                          ? "bg-white text-red-600 shadow-sm"
                          : tab.color === "green"
                            ? "bg-white text-green-600 shadow-sm"
                            : tab.color === "blue"
                              ? "bg-white text-blue-600 shadow-sm"
                              : tab.color === "purple"
                                ? "bg-white text-purple-600 shadow-sm"
                                : "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 text-xs opacity-70">
                        ({tab.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-gray-500 hover:text-gray-700"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">
            My Items, {user.name?.split(" ")[0] || "User"}! 📦
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your lost and found items
          </p>
        </motion.div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Items"
            value={totalCount}
            icon={Package}
            color="text-blue-600"
          />
          <StatsCard
            title="Lost"
            value={lostCount}
            icon={AlertCircle}
            color="text-red-500"
          />
          <StatsCard
            title="Found"
            value={foundCount}
            icon={CheckCircle}
            color="text-green-500"
          />
          <StatsCard
            title="Claimed/Returned"
            value={claimedCount + returnedCount}
            icon={CheckCircle}
            color="text-purple-600"
          />
        </div>

        {/* Active Filters */}
        {(statusFilter !== "all" || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex flex-wrap gap-2"
          >
            <span className="text-sm text-gray-500">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className={cn(
                  "cursor-pointer gap-1",
                  statusFilter === "lost"
                    ? "bg-red-100 text-red-600"
                    : statusFilter === "found"
                      ? "bg-green-100 text-green-600"
                      : statusFilter === "claimed"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600",
                )}
                onClick={() => setStatusFilter("all")}
              >
                Status:{" "}
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {searchQuery && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setSearchQuery("")}
              >
                Search: {searchQuery}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </motion.div>
        )}

        {/* Posts */}
        <AnimatePresence mode="wait">
          {isLoading && page === 1 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </motion.div>
          ) : items.length === 0 ? (
            <EmptyState statusFilter={statusFilter} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Post
                    item={item}
                    currentUserId={user.id}
                    currentUserName={user.name}
                    isAdmin={user.role === "college_admin"}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Trigger */}
        {pagination && page < pagination.pages && (
          <div className="flex justify-center py-8">
            {isFetching && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading more items...</span>
              </div>
            )}
          </div>
        )}

        {(!pagination || page >= pagination.pages) && items.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-sm text-gray-400"
          >
            You've reached the end! 🎉
          </motion.p>
        )}
      </div>
    </div>
  );
}
