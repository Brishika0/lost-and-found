import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInView } from "react-intersection-observer";
import { useLostItems } from "@/hooks/useLostItems";
import {
  Loader2,
  Plus,
  Search,
  Filter,
  X,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatUtils";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "../posts/postCard";
import { Navbar } from "../navbar";

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
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-gray-100 bg-white py-16 text-center"
  >
    <div className="mb-4 text-7xl">📭</div>
    <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
    <p className="mt-1 text-gray-500">
      Be the first to share a lost or found item!
    </p>
    <Button
      onClick={() => (window.location.href = "/create-post")}
      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transition-all hover:shadow-xl"
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Post
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
                  : "bg-green-100",
            )}
          >
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// MAIN FEED COMPONENT
export const Feed = () => {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"lost" | "found" | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [selectedSort, setSelectedSort] = useState("latest");
  const navbarRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const categories = [
    "All Categories",
    "Electronics",
    "Clothing",
    "Books",
    "Accessories",
    "Documents",
    "Keys",
    "Wallets",
    "Bags",
    "Mobile Phones",
    "Laptops",
    "ID Cards",
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const { data, isLoading, isFetching } = useLostItems({
    collegeId: user?.college?.id || "",
    page,
    limit: 10,
    status,
    category: activeCategory === "All Categories" ? undefined : activeCategory,
    search: debouncedSearch || undefined,
    sortBy: selectedSort === "latest" ? "createdAt" : "likesCount",
    sortOrder: "desc",
    isVerified: true,
    isActive: true,
  });

  // Infinite scroll
  useEffect(() => {
    if (
      inView &&
      data?.pagination &&
      page < data.pagination.pages &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  }, [inView, data?.pagination, page, isFetching]);

  const items = data?.data || [];
  const totalItems = data?.pagination.total || 0;

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  const lostCount = items.filter((i) => i.status === "lost").length;
  const foundCount = items.filter((i) => i.status === "found").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Floating Create Post Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed right-6 bottom-6 z-50"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => (window.location.href = "/create-post")}
                className="group h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <Plus className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create new post</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

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
              placeholder="Search by name, description, or tags..."
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
                <button
                  onClick={() => setStatus(undefined)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                    !status
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setStatus("lost")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                    status === "lost"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600 hover:text-red-600",
                  )}
                >
                  Lost
                </button>
                <button
                  onClick={() => setStatus("found")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                    status === "found"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-green-600",
                  )}
                >
                  Found
                </button>
              </div>

              {/* Category Select */}
              <Select
                value={activeCategory || "All Categories"}
                onValueChange={setActiveCategory}
              >
                <SelectTrigger className="w-[160px] rounded-lg border-0 bg-gray-100">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Select */}
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-[130px] rounded-lg border-0 bg-gray-100">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
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
            Welcome back, {user.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover and help reunite lost items in your college community
          </p>
        </motion.div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Posts"
            value={totalItems}
            icon={TrendingUp}
            color="text-blue-600"
          />
          <StatsCard
            title="Lost Items"
            value={lostCount}
            icon={Flame}
            color="text-red-500"
          />
          <StatsCard
            title="Found Items"
            value={foundCount}
            icon={Clock}
            color="text-green-500"
          />
        </div>

        {/* Active Filters */}
        {(activeCategory || status || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex flex-wrap gap-2"
          >
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeCategory && activeCategory !== "All Categories" && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1 hover:bg-gray-200"
                onClick={() => setActiveCategory("")}
              >
                Category: {activeCategory}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {status && (
              <Badge
                variant="secondary"
                className={cn(
                  "cursor-pointer gap-1",
                  status === "lost"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600",
                )}
                onClick={() => setStatus(undefined)}
              >
                Status: {status === "lost" ? "Lost" : "Found"}
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
            <EmptyState />
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
        {data?.pagination && page < data.pagination.pages && (
          <div ref={ref} className="flex justify-center py-8">
            {isFetching && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading more posts...</span>
              </div>
            )}
          </div>
        )}

        {(!data?.pagination || page >= data.pagination.pages) &&
          items.length > 0 && (
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
};

export default Feed;
