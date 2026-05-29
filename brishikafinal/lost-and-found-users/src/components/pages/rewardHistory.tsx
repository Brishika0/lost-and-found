import { useState } from "react";
import { useRewardTransactions, useMyRewards } from "@/hooks/useRewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  ArrowUpDown,
  Gift,
  Package,
  UserCheck,
  CheckCircle,
  TrendingUp,
  Calendar,
  Coins,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RewardPointsCard } from "../RewardPointsCard";

const TRANSACTION_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bgColor: string;
  }
> = {
  earn_item_returned: {
    label: "Item Returned",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  earn_item_found: {
    label: "Item Found",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  earn_item_claimed: {
    label: "Item Claimed",
    icon: UserCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  redeem_reward: {
    label: "Reward Redeemed",
    icon: Gift,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  bonus_streak: {
    label: "Streak Bonus",
    icon: TrendingUp,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  admin_adjustment: {
    label: "Admin Adjustment",
    icon: ArrowUpDown,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

export default function RewardHistory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: rewardsData } = useMyRewards();
  const { data: transactionsData, isLoading } = useRewardTransactions({
    page,
    limit: 20,
  });

  const userRewards = rewardsData?.data;
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
    if (
      search &&
      !transaction.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRedeemed = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const TransactionIcon = ({ type }: { type: string }) => {
    const config = TRANSACTION_TYPE_CONFIG[type];
    const Icon = config?.icon || Gift;
    return (
      <div className={cn("rounded-full p-2", config?.bgColor || "bg-gray-100")}>
        <Icon className={cn("h-4 w-4", config?.color || "text-gray-600")} />
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reward History</h1>
          <p className="text-sm text-gray-500">
            Track your points, transactions, and rewards
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Points Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Points Redeemed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalRedeemed.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Gift className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Points</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userRewards?.availablePoints.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reward Points Card - Sidebar */}
        <div className="lg:col-span-1">
          <RewardPointsCard showRedeemButton={false} />
        </div>

        {/* Transaction History - Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {pagination?.total || 0} transactions
                </Badge>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="earn_item_returned">
                      Item Returned
                    </SelectItem>
                    <SelectItem value="earn_item_found">Item Found</SelectItem>
                    <SelectItem value="earn_item_claimed">
                      Item Claimed
                    </SelectItem>
                    <SelectItem value="redeem_reward">
                      Reward Redeemed
                    </SelectItem>
                    <SelectItem value="bonus_streak">Streak Bonus</SelectItem>
                    <SelectItem value="admin_adjustment">
                      Admin Adjustment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Gift className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No transactions yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start returning found items to earn points!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => {
                      const config = TRANSACTION_TYPE_CONFIG[transaction.type];
                      const isEarn = transaction.amount > 0;

                      return (
                        <div
                          key={transaction._id}
                          className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-gray-50"
                        >
                          <TransactionIcon type={transaction.type} />
                          <div className="flex-1">
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              <Calendar className="mr-1 inline h-3 w-3" />
                              {new Date(
                                transaction.createdAt,
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {transaction.referenceId && (
                              <p className="mt-1 text-xs text-gray-400">
                                Reference: {transaction.referenceId.slice(-8)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge
                              className={cn(
                                isEarn
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              {isEarn
                                ? `+${transaction.amount}`
                                : `${transaction.amount}`}{" "}
                              pts
                            </Badge>
                            {config && (
                              <p className="mt-1 text-xs text-gray-400">
                                {config.label}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total,
                        )}{" "}
                        of {pagination.total} transactions
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(pagination.pages, p + 1))
                          }
                          disabled={page === pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
