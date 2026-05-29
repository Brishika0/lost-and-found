import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMyRewards } from "@/hooks/useRewards";
import {
  Trophy,
  Gift,
  Award,
  Sparkles,
  Crown,
  Zap,
  Coins,
  CheckCircle,
  Package,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardPointsCardProps {
  showRedeemButton?: boolean;
  onRedeemClick?: () => void;
  compact?: boolean;
  className?: string;
}

const LEVEL_CONFIG: Record<
  string,
  {
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: any;
    nextLevelPoints: number | null;
  }
> = {
  bronze: {
    color: "from-amber-600 to-amber-700",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: Award,
    nextLevelPoints: 1000,
  },
  silver: {
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    icon: Trophy,
    nextLevelPoints: 5000,
  },
  gold: {
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    icon: Crown,
    nextLevelPoints: 10000,
  },
  platinum: {
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    icon: Sparkles,
    nextLevelPoints: null,
  },
};

// Helper to determine level based on total points
const getLevelFromPoints = (points: number): string => {
  if (points >= 10000) return "platinum";
  if (points >= 5000) return "gold";
  if (points >= 1000) return "silver";
  return "bronze";
};

export function RewardPointsCard({
  showRedeemButton = true,
  onRedeemClick,
  compact = false,
  className,
}: RewardPointsCardProps) {
  const { data: rewardsData, isLoading } = useMyRewards();
  const userRewards = rewardsData?.data;

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userRewards) return null;

  const level = getLevelFromPoints(userRewards.totalPoints);
  const levelConfig = LEVEL_CONFIG[level];
  const LevelIcon = levelConfig?.icon || Award;
  const progressToNextLevel = levelConfig?.nextLevelPoints
    ? (userRewards.totalPoints / levelConfig.nextLevelPoints) * 100
    : 100;
  const pointsToNextLevel = levelConfig?.nextLevelPoints
    ? levelConfig.nextLevelPoints - userRewards.totalPoints
    : 0;

  if (compact) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className={cn("bg-gradient-to-r p-4", levelConfig?.color)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Your Points</p>
              <p className="text-3xl font-bold text-white">
                {userRewards.availablePoints.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Coins className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <LevelIcon className="h-4 w-4 text-yellow-500" />
              <span className="capitalize">{level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gift className="h-4 w-4 text-purple-500" />
              <span>
                {userRewards.redeemedPoints.toLocaleString()} redeemed
              </span>
            </div>
          </div>
          {showRedeemButton && (
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={onRedeemClick}
              disabled={userRewards.availablePoints === 0}
            >
              <Gift className="mr-2 h-4 w-4" />
              Redeem Points
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full overflow-hidden p-0", className)}>
      {/* Header with gradient based on level */}
      <div className={cn("bg-gradient-to-r p-6", levelConfig?.color)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Total Points</p>
            <p className="text-4xl font-bold text-white">
              {userRewards.totalPoints.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <LevelIcon className="h-5 w-5 text-white/90" />
              <span className="text-sm font-medium text-white/90 capitalize">
                {level} Member
              </span>
            </div>
          </div>
          <div className="rounded-full bg-white/20 p-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Points Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-xl font-bold text-green-600">
              {userRewards.availablePoints.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Earned</p>
            <p className="text-xl font-bold text-blue-600">
              {userRewards.earnedPoints.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Redeemed</p>
            <p className="text-xl font-bold text-purple-600">
              {userRewards.redeemedPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        {levelConfig?.nextLevelPoints && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Next Level Progress</span>
              <span className="font-medium text-gray-700">
                {pointsToNextLevel} points to{" "}
                {level === "bronze"
                  ? "Silver"
                  : level === "silver"
                    ? "Gold"
                    : "Platinum"}
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1.5">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Returned</p>
              <p className="text-sm font-semibold">
                {userRewards.itemsReturned}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-1.5">
              <Package className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Found</p>
              <p className="text-sm font-semibold">{userRewards.itemsFound}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-1.5">
              <UserCheck className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Claimed</p>
              <p className="text-sm font-semibold">
                {userRewards.itemsClaimed}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Bonus */}
        {userRewards.streak > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-orange-50 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {userRewards.streak} Day Streak!
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700"
            >
              +{Math.min(userRewards.streak * 5, 100)} bonus next
            </Badge>
          </div>
        )}

        {/* Redeem Button */}
        {showRedeemButton && (
          <Button
            className="mt-4 w-full"
            onClick={onRedeemClick}
            disabled={userRewards.availablePoints === 0}
          >
            <Gift className="mr-2 h-4 w-4" />
            Redeem Your Points
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
