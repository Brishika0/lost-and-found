import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Star,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  AlertCircle,
  Coins,
} from "lucide-react";
import { format } from "date-fns";
import type { Coupon } from "@/types/coupon.types";

interface CouponDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  userPoints: number;
  hasClaimed: boolean;
  isClaiming: boolean;
  onClaim: (coupon: Coupon) => void;
}

export function CouponDetailsDialog({
  open,
  onOpenChange,
  coupon,
  userPoints = 0,
  hasClaimed = false,
  isClaiming = false,
  onClaim,
}: CouponDetailsDialogProps) {
  // Early return if no coupon
  if (!coupon) {
    return null;
  }

  // Safely get values with defaults
  const pointsRequired = coupon.pointsRequired || 0;
  const originalValue = coupon.originalValue || 0;
  const discountValue = coupon.discountValue || 0;
  const canClaim = userPoints >= pointsRequired && !hasClaimed;
  const pointsNeeded = pointsRequired - userPoints;

  // Format dates safely
  const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : new Date();
  const validUntil = coupon.validUntil
    ? new Date(coupon.validUntil)
    : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 space-y-0 overflow-y-auto p-0">
        {/* Dialog Header with Gradient */}
        <div
          className={`sticky top-0 z-10 border-b p-4 md:p-6 ${
            coupon.isFeatured
              ? "bg-gradient-to-r from-yellow-50 to-orange-50"
              : "bg-gray-50"
          }`}
        >
          <DialogHeader className="gap-1 p-0">
            <div className="flex flex-wrap items-center gap-2">
              {coupon.isFeatured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
              <Badge className="capitalize">
                {coupon.couponType || "Coupon"}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {coupon.couponCode || "N/A"}
              </Badge>
            </div>
            <DialogTitle className="text-xl md:text-2xl">
              {coupon.title || "Coupon Details"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {coupon.description || "No description available"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-4 md:p-6">
          {/* Discount & Points - Responsive grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-3 text-center md:p-4">
              <DollarSign className="mx-auto mb-1 h-5 w-5 text-green-600 md:h-6 md:w-6" />
              <div className="text-xl font-bold text-green-700 md:text-2xl">
                {coupon.discountType === "percentage"
                  ? `${discountValue}%`
                  : `$${discountValue}`}
              </div>
              <div className="text-xs text-green-600">Discount</div>
              <div className="text-muted-foreground mt-1 text-xs">
                <span className="line-through">${originalValue}</span>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-3 text-center md:p-4">
              <Star className="mx-auto mb-1 h-5 w-5 text-purple-600 md:h-6 md:w-6" />
              <div className="text-xl font-bold text-purple-700 md:text-2xl">
                {pointsRequired.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">Points Required</div>
              <div className="text-muted-foreground mt-1 text-xs">
                You have: {userPoints.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="rounded-xl bg-gray-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4" />
              Validity Period
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid From:</span>
                <span>{format(validFrom, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until:</span>
                <span className="font-medium">{format(validUntil, "PPP")}</span>
              </div>
              {coupon.minimumOrderValue && coupon.minimumOrderValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Order:</span>
                  <span>${coupon.minimumOrderValue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(coupon.canteenName || coupon.canteenLocation) && (
            <div className="rounded-xl bg-gray-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4" />
                Redeem At
              </h4>
              <div className="space-y-1 text-sm">
                {coupon.canteenName && (
                  <p className="font-medium">{coupon.canteenName}</p>
                )}
                {coupon.canteenLocation && (
                  <p className="text-muted-foreground text-sm">
                    {coupon.canteenLocation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {coupon.instructions && (
            <div className="rounded-xl bg-blue-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-blue-600" />
                How to Use
              </h4>
              <p className="text-muted-foreground text-sm">
                {coupon.instructions}
              </p>
            </div>
          )}

          {/* Terms */}
          {coupon.termsAndConditions &&
            coupon.termsAndConditions.length > 0 && (
              <div className="rounded-xl bg-gray-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Terms & Conditions
                </h4>
                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                  {coupon.termsAndConditions.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Claim Button */}
          <div className="pt-2">
            <Button
              className="w-full text-sm md:text-base"
              size="lg"
              disabled={!canClaim || isClaiming}
              onClick={() => {
                onClaim(coupon);
                onOpenChange(false);
              }}
            >
              {isClaiming ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : hasClaimed ? (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Already Claimed
                </>
              ) : !canClaim ? (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Need {pointsNeeded} More Points
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Claim for {pointsRequired.toLocaleString()} Points
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
