import { useMyRewards } from "@/hooks/useRewards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Award, Coins, Gift, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardPointsBadgeProps {
  variant?: "default" | "compact" | "icon-only";
  showLevel?: boolean;
  className?: string;
}

const LEVEL_COLORS = {
  bronze: "from-amber-600 to-amber-700 bg-amber-100 text-amber-700",
  silver: "from-gray-400 to-gray-500 bg-gray-100 text-gray-700",
  gold: "from-yellow-500 to-yellow-600 bg-yellow-100 text-yellow-700",
  platinum: "from-cyan-500 to-blue-600 bg-cyan-100 text-cyan-700",
};

const LEVEL_NAMES = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

// Helper to determine level based on total points
const getLevelFromPoints = (points: number): string => {
  if (points >= 10000) return "platinum";
  if (points >= 5000) return "gold";
  if (points >= 1000) return "silver";
  return "bronze";
};

export function RewardPointsBadge({
  variant = "default",
  showLevel = true,
}: RewardPointsBadgeProps) {
  const { data: rewardsData, isLoading } = useMyRewards();
  const userRewards = rewardsData?.data;

  if (isLoading) {
    if (variant === "icon-only") {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }
    return <Skeleton className="h-10 w-28 rounded-full" />;
  }

  if (!userRewards) return null;

  const level = getLevelFromPoints(userRewards.totalPoints);
  const levelColor = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS];
  const levelName = LEVEL_NAMES[level as keyof typeof LEVEL_NAMES];

  // Icon-only variant (just the points with icon)
  if (variant === "icon-only") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-1">
              <Coins className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white">
                {userRewards.availablePoints}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userRewards.availablePoints} points available</p>
            <p className="text-xs text-gray-500">
              Total earned: {userRewards.totalPoints}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant (small badge)
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 transition-all hover:bg-gray-50">
              <div className={cn("rounded-full p-1", levelColor.split(" ")[2])}>
                <Award
                  className={cn("h-3.5 w-3.5", levelColor.split(" ")[3])}
                />
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-sm font-semibold">
                  {userRewards.availablePoints}
                </span>
              </div>
              {showLevel && (
                <span className="text-xs text-gray-500 capitalize">
                  ({levelName})
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Reward Points</p>
              <p>
                Available:{" "}
                <span className="font-bold text-green-600">
                  {userRewards.availablePoints}
                </span>
              </p>
              <p>
                Total earned:{" "}
                <span className="font-bold text-blue-600">
                  {userRewards.totalPoints}
                </span>
              </p>
              <p>Items returned: {userRewards.itemsReturned}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant (full badge)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md">
            {/* Level Icon */}
            <div className={cn("rounded-full p-2", levelColor.split(" ")[2])}>
              <Award className={cn("h-5 w-5", levelColor.split(" ")[3])} />
            </div>

            {/* Points Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-xl font-bold">
                  {userRewards.availablePoints}
                </span>
                <span className="text-xs text-gray-500">points available</span>
              </div>
              {showLevel && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize">
                    {levelName} Member
                  </span>
                  <div className="h-1 w-12 rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-1 rounded-full",
                        level === "platinum"
                          ? "w-full bg-cyan-500"
                          : level === "gold"
                            ? "w-3/4 bg-yellow-500"
                            : level === "silver"
                              ? "w-1/2 bg-gray-400"
                              : "w-1/4 bg-amber-500",
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Small Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{userRewards.earnedPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                <span>{userRewards.itemsReturned || 0}</span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64">
          <div className="space-y-2">
            <p className="font-semibold">Reward Points Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Available</p>
                <p className="font-bold text-green-600">
                  {userRewards.availablePoints}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Earned</p>
                <p className="font-bold text-blue-600">
                  {userRewards.earnedPoints}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Redeemed</p>
                <p className="font-bold text-purple-600">
                  {userRewards.redeemedPoints}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Items Returned</p>
                <p className="font-bold text-green-600">
                  {userRewards.itemsReturned}
                </p>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
