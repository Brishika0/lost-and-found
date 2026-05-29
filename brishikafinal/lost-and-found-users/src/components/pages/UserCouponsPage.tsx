import { useState, useCallback } from "react";
import {
  useAvailableCoupons,
  useUserCoupons,
  useClaimCoupon,
} from "@/hooks/useCoupon";
import { useMyRewards } from "@/hooks/useRewards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gift,
  Star,
  Clock,
  DollarSign,
  Ticket,
  MapPin,
  TrendingUp,
  CheckCircle,
  Zap,
  QrCode,
  Copy,
  Check,
  Award,
  Coins,
} from "lucide-react";
import { format } from "date-fns";
import type { Coupon, UserCoupon } from "@/types/coupon.types";
import { CouponDetailsDialog } from "@/components/dialogs/CouponDetailsDialog";

export default function UserCouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Queries
  const {
    data: availableCoupons = [],
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = useAvailableCoupons();
  const {
    data: userCoupons = [],
    isLoading: isLoadingUserCoupons,
    refetch: refetchUserCoupons,
  } = useUserCoupons();
  const { data: myRewards, refetch: refetchRewards } = useMyRewards();

  // Mutation
  const claimCoupon = useClaimCoupon();

  // Get user points from rewards data
  const userPoints = myRewards?.data?.availablePoints || 0;
  const totalEarned = myRewards?.data?.earnedPoints || 0;
  const itemsReturned = myRewards?.data?.itemsReturned || 0;

  // Filter coupons
  const filteredCoupons = availableCoupons.filter((coupon) => {
    const matchesSearch =
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || coupon.couponType === selectedType;
    return matchesSearch && matchesType;
  });

  // Sort coupons: featured first, then by points required
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.pointsRequired - b.pointsRequired;
  });

  const handleClaimCoupon = useCallback(
    async (coupon: Coupon) => {
      await claimCoupon.mutateAsync({ couponId: coupon._id });
      // Refetch all data after claiming
      refetchAvailable();
      refetchUserCoupons();
      refetchRewards();
    },
    [claimCoupon, refetchAvailable, refetchUserCoupons, refetchRewards],
  );

  const handleViewDetails = useCallback((coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailsDialogOpen(true);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPointsToNextCoupon = () => {
    const cheapestCoupon = [...availableCoupons].sort(
      (a, b) => a.pointsRequired - b.pointsRequired,
    )[0];
    if (!cheapestCoupon) return null;
    const pointsNeeded = cheapestCoupon.pointsRequired - userPoints;
    return pointsNeeded > 0 ? pointsNeeded : null;
  };

  const pointsToNext = getPointsToNextCoupon();

  // Helper function to check if a coupon is claimed
  const isCouponClaimed = useCallback(
    (couponId: string) => {
      return userCoupons.some((uc: UserCoupon) => {
        const id =
          typeof uc.couponId === "string" ? uc.couponId : uc.couponId?._id;
        return id === couponId;
      });
    },
    [userCoupons],
  );

  // Helper function to get coupon from userCoupon
  const getCouponFromUserCoupon = useCallback(
    (userCoupon: UserCoupon): Coupon | null => {
      if (typeof userCoupon.couponId === "string") {
        return (
          availableCoupons.find((c) => c._id === userCoupon.couponId) || null
        );
      }
      return userCoupon.couponId;
    },
    [availableCoupons],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-2 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
              Rewards Marketplace
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Redeem your hard-earned points for exclusive coupons and offers
            </p>
          </div>

          {/* Points Card */}
          <Card className="w-full bg-gradient-to-r from-amber-500 to-orange-500 p-0 text-white shadow-lg lg:w-auto">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 md:text-sm">Your Points</p>
                  <p className="text-2xl font-bold md:text-3xl">
                    {userPoints.toLocaleString()}
                  </p>
                </div>
                <Coins className="h-6 w-6 opacity-90 md:h-8 md:w-8" />
              </div>
              {pointsToNext && pointsToNext > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-white/20">
                    <div
                      className="h-1.5 rounded-full bg-white transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (userPoints / (userPoints + pointsToNext)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs opacity-80">
                    Need {pointsToNext} more points for next coupon
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Card className="border-l-4 border-l-green-500 p-0">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-lg bg-green-100 p-1.5 md:p-2">
                  <Gift className="h-4 w-4 text-green-600 md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold md:text-2xl">
                    {availableCoupons.length}
                  </p>
                  <p className="text-muted-foreground text-xs">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 p-0">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-lg bg-blue-100 p-1.5 md:p-2">
                  <Ticket className="h-4 w-4 text-blue-600 md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold md:text-2xl">
                    {
                      userCoupons.filter(
                        (uc: UserCoupon) => uc.status === "active",
                      ).length
                    }
                  </p>
                  <p className="text-muted-foreground text-xs">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500 p-0">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-lg bg-purple-100 p-1.5 md:p-2">
                  <Award className="h-4 w-4 text-purple-600 md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold md:text-2xl">
                    {totalEarned.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500 p-0">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="rounded-lg bg-orange-100 p-1.5 md:p-2">
                  <TrendingUp className="h-4 w-4 text-orange-600 md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold md:text-2xl">
                    {itemsReturned}
                  </p>
                  <p className="text-muted-foreground text-xs">Returned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="available" className="text-sm">
              Available
            </TabsTrigger>
            <TabsTrigger value="my-coupons" className="text-sm">
              My Coupons
            </TabsTrigger>
          </TabsList>

          {/* Available Coupons Tab */}
          <TabsContent value="available" className="mt-4 space-y-4 md:mt-6">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="canteen">Canteen</SelectItem>
                  <SelectItem value="cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coupons Grid */}
            {isLoadingAvailable ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : sortedCoupons.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Gift className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">No coupons available</p>
                  <p className="text-muted-foreground text-sm">
                    Check back later for new offers!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {sortedCoupons.map((coupon) => {
                  const canClaim = userPoints >= coupon.pointsRequired;
                  const hasClaimed = isCouponClaimed(coupon._id);
                  const isExpiringSoon =
                    new Date(coupon.validUntil) <
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  const discountPercent =
                    coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`;

                  return (
                    <Card
                      key={coupon._id}
                      className={`group gap-1 overflow-hidden py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        coupon.isFeatured ? "border-yellow-400 shadow-md" : ""
                      }`}
                    >
                      {coupon.isFeatured && (
                        <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 text-xs font-medium text-white">
                          <Star className="h-3 w-3 fill-current" />
                          Featured Offer
                        </div>
                      )}
                      <CardHeader className="gap-0 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <Badge className="text-xs capitalize">
                              {coupon.couponType}
                            </Badge>
                            <CardTitle className="line-clamp-1 text-base md:text-lg">
                              {coupon.title}
                            </CardTitle>
                          </div>
                          {isExpiringSoon && (
                            <Badge
                              variant="destructive"
                              className="text-xs whitespace-nowrap"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Soon
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 text-xs md:text-sm">
                          {coupon.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              {discountPercent} OFF
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <DollarSign className="h-3 w-3" />
                              <span className="line-through">
                                ${coupon.originalValue}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1">
                            <Star className="h-3 w-3 fill-purple-600 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700">
                              {coupon.pointsRequired.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {!hasClaimed && !canClaim && (
                          <div className="space-y-1">
                            <div className="h-1.5 w-full rounded-full bg-gray-200">
                              <div
                                className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                                style={{
                                  width: `${(userPoints / coupon.pointsRequired) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-muted-foreground text-xs">
                              Need {coupon.pointsRequired - userPoints} more
                              points
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 text-xs"
                          onClick={() => handleViewDetails(coupon)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 flex-1 text-xs"
                          disabled={
                            hasClaimed || !canClaim || claimCoupon.isPending
                          }
                          onClick={() => handleClaimCoupon(coupon)}
                        >
                          {claimCoupon.isPending &&
                          claimCoupon.variables?.couponId === coupon._id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : hasClaimed ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Claimed
                            </>
                          ) : !canClaim ? (
                            <>
                              <Zap className="mr-1 h-3 w-3" />
                              Need More
                            </>
                          ) : (
                            <>
                              <Gift className="mr-1 h-3 w-3" />
                              Claim
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* My Coupons Tab */}
          <TabsContent value="my-coupons" className="mt-4 md:mt-6">
            {isLoadingUserCoupons ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userCoupons.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Ticket className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">No coupons yet</p>
                  <p className="text-muted-foreground text-sm">
                    Browse available coupons and start saving!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Active Coupons */}
                {userCoupons.filter((uc: UserCoupon) => uc.status === "active")
                  .length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold md:text-lg">
                      <div className="h-5 w-1 rounded-full bg-green-500" />
                      Active Coupons
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                      {userCoupons
                        .filter((uc: UserCoupon) => uc.status === "active")
                        .map((userCoupon: UserCoupon) => {
                          const coupon = getCouponFromUserCoupon(userCoupon);
                          const isExpired =
                            new Date(userCoupon.expiresAt) < new Date();
                          if (!coupon) return null;

                          return (
                            <Card
                              key={userCoupon._id}
                              className="gap-2 overflow-hidden border-l-4 border-l-green-500 p-0 pb-3"
                            >
                              <CardHeader className="gap-0 bg-gradient-to-r from-green-50 to-emerald-50/30 pt-2 pb-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base md:text-lg">
                                      {coupon.title}
                                    </CardTitle>
                                    <div className="mt-1 flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="font-mono text-xs"
                                      >
                                        {userCoupon.couponCode}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={() =>
                                          handleCopyCode(userCoupon.couponCode)
                                        }
                                      >
                                        {copiedCode ===
                                        userCoupon.couponCode ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  {userCoupon.redemptionMethod === "qr" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-white"
                                    >
                                      <QrCode className="mr-1 h-3 w-3" />
                                      QR
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Discount:
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {coupon.discountType === "percentage"
                                      ? `${coupon.discountValue}% OFF`
                                      : `$${coupon.discountValue} OFF`}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Expires:
                                  </span>
                                  <span
                                    className={
                                      isExpired
                                        ? "font-medium text-red-600"
                                        : "text-sm"
                                    }
                                  >
                                    {format(
                                      new Date(userCoupon.expiresAt),
                                      "MMM dd, yyyy",
                                    )}
                                  </span>
                                </div>
                                {coupon.canteenName && (
                                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate text-xs">
                                      {coupon.canteenName}
                                    </span>
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => handleViewDetails(coupon)}
                                >
                                  View Details
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Used & Expired Coupons */}
                {userCoupons.filter((uc: UserCoupon) => uc.status !== "active")
                  .length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold md:text-lg">
                      <div className="h-5 w-1 rounded-full bg-gray-400" />
                      Used & Expired
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                      {userCoupons
                        .filter((uc: UserCoupon) => uc.status !== "active")
                        .map((userCoupon: UserCoupon) => {
                          const coupon = getCouponFromUserCoupon(userCoupon);
                          if (!coupon) return null;

                          return (
                            <Card
                              key={userCoupon._id}
                              className="bg-gray-50/50 opacity-75"
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-base">
                                    {coupon.title}
                                  </CardTitle>
                                  <Badge
                                    variant={
                                      userCoupon.status === "used"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {userCoupon.status === "used"
                                      ? "Used"
                                      : "Expired"}
                                  </Badge>
                                </div>
                                <CardDescription className="font-mono text-xs">
                                  {userCoupon.couponCode}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground text-xs">
                                  {userCoupon.status === "used" &&
                                  userCoupon.usedAt
                                    ? `Used on ${format(new Date(userCoupon.usedAt), "MMM dd, yyyy")}`
                                    : `Expired on ${format(new Date(userCoupon.expiresAt), "MMM dd, yyyy")}`}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Coupon Details Dialog - Separate Component */}
        <CouponDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          coupon={selectedCoupon}
          userPoints={userPoints}
          hasClaimed={
            selectedCoupon ? isCouponClaimed(selectedCoupon._id) : false
          }
          isClaiming={claimCoupon.isPending}
          onClaim={handleClaimCoupon}
        />
      </div>
    </div>
  );
}
