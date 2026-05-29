import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Coupon } from "@/types/coupon.types";
import {
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Clock,
  Infinity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building,
  Award,
  TrendingUp,
  CreditCard,
  QrCode,
  FileText,
  Info,
} from "lucide-react";

interface ViewCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

export function ViewCouponDialog({
  open,
  onOpenChange,
  coupon,
}: ViewCouponDialogProps) {
  if (!coupon) return null;

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; bgColor: string; icon: React.ReactNode; label: string }
    > = {
      active: {
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: "Active",
      },
      expired: {
        color: "text-gray-700",
        bgColor: "bg-gray-50 border-gray-200",
        icon: <XCircle className="h-4 w-4 text-gray-600" />,
        label: "Expired",
      },
      used: {
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
        label: "Used",
      },
      cancelled: {
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.active;
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      canteen: {
        label: "Canteen",
        color: "bg-blue-100 text-blue-700",
        icon: <Building className="h-3 w-3" />,
      },
      cafeteria: {
        label: "Cafeteria",
        color: "bg-green-100 text-green-700",
        icon: <Coffee className="h-3 w-3" />,
      },
      meal: {
        label: "Meal",
        color: "bg-purple-100 text-purple-700",
        icon: <Utensils className="h-3 w-3" />,
      },
      snack: {
        label: "Snack",
        color: "bg-orange-100 text-orange-700",
        icon: <Snack className="h-3 w-3" />,
      },
      beverage: {
        label: "Beverage",
        color: "bg-cyan-100 text-cyan-700",
        icon: <Coffee className="h-3 w-3" />,
      },
    };
    return configs[type] || configs.canteen;
  };

  const statusConfig = getStatusConfig(coupon.status);
  const typeConfig = getTypeConfig(coupon.couponType);
  const isExpiringSoon =
    new Date(coupon.validUntil) <
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isLowStock =
    !coupon.isUnlimited &&
    (coupon.remainingQuantity || 0) <= (coupon.totalQuantity || 0) * 0.2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <ScrollArea className="max-h-[85vh]">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <Badge className={typeConfig.color}>
                      <span className="flex items-center gap-1">
                        {typeConfig.icon}
                        {typeConfig.label}
                      </span>
                    </Badge>
                    {coupon.isFeatured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={statusConfig.bgColor}>
                      <span
                        className={`flex items-center gap-1 ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </Badge>
                  </div>
                  <DialogTitle className="mb-2 text-2xl font-bold text-white">
                    {coupon.title}
                  </DialogTitle>
                  <p className="font-mono text-sm text-blue-100">
                    {coupon.couponCode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white">
                      {coupon.pointsRequired.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-100">Points Required</div>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
            {/* Description */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="leading-relaxed text-gray-700">
                {coupon.description}
              </p>
            </div>

            {/* Alert Section for Expiring Soon or Low Stock */}
            {(isExpiringSoon || isLowStock) && coupon.status === "active" && (
              <div
                className={`flex items-start gap-3 rounded-lg p-4 ${
                  isExpiringSoon
                    ? "border border-yellow-200 bg-yellow-50"
                    : "border border-orange-200 bg-orange-50"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 flex-shrink-0 ${isExpiringSoon ? "text-yellow-600" : "text-orange-600"}`}
                />
                <div>
                  <p
                    className={`font-semibold ${isExpiringSoon ? "text-yellow-800" : "text-orange-800"}`}
                  >
                    {isExpiringSoon ? "Expiring Soon" : "Low Stock Alert"}
                  </p>
                  <p
                    className={`text-sm ${isExpiringSoon ? "text-yellow-700" : "text-orange-700"}`}
                  >
                    {isExpiringSoon
                      ? `This coupon expires on ${format(new Date(coupon.validUntil), "MMMM dd, yyyy")}`
                      : `Only ${coupon.remainingQuantity} of ${coupon.totalQuantity} coupons remaining`}
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 text-center">
                <DollarSign className="mx-auto mb-2 h-6 w-6 text-green-600" />
                <div className="text-2xl font-bold text-green-700">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </div>
                <div className="text-xs font-medium text-green-600">
                  Discount
                </div>
                {coupon.discountType === "percentage" &&
                  coupon.maximumDiscount && (
                    <div className="mt-1 text-xs text-green-600">
                      Max ${coupon.maximumDiscount}
                    </div>
                  )}
              </div>

              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
                <Award className="mx-auto mb-2 h-6 w-6 text-purple-600" />
                <div className="text-2xl font-bold text-purple-700">
                  {coupon.pointsRequired.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-purple-600">
                  Points Required
                </div>
                <div className="mt-1 text-xs text-purple-600">
                  Value: ${coupon.originalValue}
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <div className="text-2xl font-bold text-blue-700">
                  {coupon.totalRedemptions.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-blue-600">
                  Redemptions
                </div>
                {!coupon.isUnlimited && coupon.totalQuantity && (
                  <div className="mt-1 text-xs text-blue-600">
                    of {coupon.totalQuantity}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 text-center">
                <CreditCard className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-700">
                  {coupon.totalPointsRedeemed.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-indigo-600">
                  Points Redeemed
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="overflow-hidden rounded-lg border">
              <div className="border-b bg-gray-50 px-4 py-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4" />
                  Validity Period
                </h3>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valid From:</span>
                  <span className="font-medium">
                    {format(
                      new Date(coupon.validFrom),
                      "EEEE, MMMM dd, yyyy 'at' hh:mm a",
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">
                    {format(
                      new Date(coupon.validUntil),
                      "EEEE, MMMM dd, yyyy 'at' hh:mm a",
                    )}
                  </span>
                </div>
                {coupon.minimumOrderValue && coupon.minimumOrderValue > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minimum Order:</span>
                    <span className="font-medium">
                      ${coupon.minimumOrderValue}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Redemption & Location Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Redemption Info */}
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-gray-50 px-4 py-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <QrCode className="h-4 w-4" />
                    Redemption Details
                  </h3>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <Badge variant="outline" className="capitalize">
                      {coupon.redemptionMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">
                      {coupon.couponType}
                    </span>
                  </div>
                  {coupon.userLimitPerCoupon && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Limit:</span>
                      <span>{coupon.userLimitPerCoupon} per user</span>
                    </div>
                  )}
                  {coupon.dailyUsageLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Limit:</span>
                      <span>{coupon.dailyUsageLimit} per day</span>
                    </div>
                  )}
                  {coupon.weeklyUsageLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Limit:</span>
                      <span>{coupon.weeklyUsageLimit} per week</span>
                    </div>
                  )}
                  {!coupon.isUnlimited && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-green-600">
                        {coupon.remainingQuantity} of {coupon.totalQuantity}
                      </span>
                    </div>
                  )}
                  {coupon.isUnlimited && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="flex items-center gap-1">
                        <Infinity className="h-3 w-3" />
                        Unlimited
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              {(coupon.canteenName || coupon.canteenLocation) && (
                <div className="overflow-hidden rounded-lg border">
                  <div className="border-b bg-gray-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h3>
                  </div>
                  <div className="space-y-3 p-4">
                    {coupon.canteenName && (
                      <div>
                        <div className="text-sm text-gray-600">Venue</div>
                        <div className="font-medium">{coupon.canteenName}</div>
                      </div>
                    )}
                    {coupon.canteenLocation && (
                      <div>
                        <div className="text-sm text-gray-600">Address</div>
                        <div className="font-medium">
                          {coupon.canteenLocation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* College Info */}
            <div className="overflow-hidden rounded-lg border">
              <div className="border-b bg-gray-50 px-4 py-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Building className="h-4 w-4" />
                  College Information
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">College:</span>
                  <span className="font-medium">
                    {typeof coupon.collegeId === "string"
                      ? coupon.collegeId
                      : coupon.collegeId.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {coupon.instructions && (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-gray-50 px-4 py-3">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Info className="h-4 w-4" />
                    Usage Instructions
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-700">{coupon.instructions}</p>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {coupon.termsAndConditions &&
              coupon.termsAndConditions.length > 0 && (
                <div className="overflow-hidden rounded-lg border">
                  <div className="border-b bg-gray-50 px-4 py-3">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <FileText className="h-4 w-4" />
                      Terms & Conditions
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {coupon.termsAndConditions.map((term, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-blue-500">•</span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* Footer with Timestamps */}
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Created:{" "}
                  {format(
                    new Date(coupon.createdAt),
                    "MMM dd, yyyy 'at' hh:mm a",
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated:{" "}
                  {format(
                    new Date(coupon.updatedAt),
                    "MMM dd, yyyy 'at' hh:mm a",
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper components for missing icons
const Coffee = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3h14M5 3v12a4 4 0 004 4h6a4 4 0 004-4V3H5zM3 7h2m14 0h2M8 7v8m8-8v8"
    />
  </svg>
);

const Utensils = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3v4a3 3 0 003 3m0 0a3 3 0 01-3 3m0-6h1m1 0h3M12 3v4a3 3 0 003 3m0 0a3 3 0 01-3 3m0-6h-1m1 0h-3M21 3v4a3 3 0 01-3 3m0 0a3 3 0 003 3m0-6h1m-1 0h-3"
    />
  </svg>
);

const Snack = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
