// src/components/dialogs/coupons/EditCouponDialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateCoupon } from "@/hooks/useCoupon";
import {
  Gift,
  Ticket,
  Calendar,
  DollarSign,
  Star,
  Infinity,
  Edit,
} from "lucide-react";
import {
  updateCouponSchema,
  type UpdateCouponFormData,
} from "@/schema/coupon.schema";
import { useGetColleges } from "@/hooks/useColleges";
import type { Coupon } from "@/types/coupon.types";

interface EditCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSuccess: () => void;
}

export function EditCouponDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: EditCouponDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const { data: collegesData } = useGetColleges({
    page: 1,
    limit: 100,
  });

  const updateCoupon = useUpdateCoupon();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<UpdateCouponFormData>({
    resolver: zodResolver(updateCouponSchema) as any,
    mode: "onChange",
    defaultValues: {
      couponType: "canteen",
      title: "",
      description: "",
      discountType: "fixed",
      discountValue: 0,
      pointsRequired: 0,
      originalValue: 0,
      validFrom: "",
      validUntil: "",
      isUnlimited: true,
      totalQuantity: undefined,
      collegeId: "",
      canteenName: "",
      canteenLocation: "",
      minimumOrderValue: 0,
      maximumDiscount: undefined,
      redemptionMethod: "code",
      userLimitPerCoupon: 1,
      dailyUsageLimit: undefined,
      weeklyUsageLimit: undefined,
      allowedItems: [],
      termsAndConditions: [],
      instructions: "",
      isFeatured: false,
      sortOrder: 0,
      status: "active",
    },
  });

  const isUnlimited = watch("isUnlimited");
  const discountType = watch("discountType");
  const currentStatus = watch("status");

  // Format date for datetime-local input
  const formatLocalDateTime = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (coupon && open) {
      const collegeIdValue =
        typeof coupon.collegeId === "string"
          ? coupon.collegeId
          : coupon.collegeId._id;

      reset({
        couponType: coupon.couponType,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        pointsRequired: coupon.pointsRequired,
        originalValue: coupon.originalValue,
        validFrom: formatLocalDateTime(coupon.validFrom),
        validUntil: formatLocalDateTime(coupon.validUntil),
        isUnlimited: coupon.isUnlimited,
        totalQuantity: coupon.totalQuantity,
        collegeId: collegeIdValue,
        canteenName: coupon.canteenName || "",
        canteenLocation: coupon.canteenLocation || "",
        minimumOrderValue: coupon.minimumOrderValue || 0,
        maximumDiscount: coupon.maximumDiscount,
        redemptionMethod: coupon.redemptionMethod,
        userLimitPerCoupon: coupon.userLimitPerCoupon || 1,
        dailyUsageLimit: coupon.dailyUsageLimit,
        weeklyUsageLimit: coupon.weeklyUsageLimit,
        allowedItems: coupon.allowedItems || [],
        termsAndConditions: coupon.termsAndConditions || [],
        instructions: coupon.instructions || "",
        isFeatured: coupon.isFeatured,
        sortOrder: coupon.sortOrder,
      });
      setActiveTab("basic");
    }
  }, [coupon, open, reset]);

  // Check if current tab fields are valid
  const isCurrentTabValid = async () => {
    const fieldsToValidate = getFieldsForCurrentTab();
    const result = await trigger(fieldsToValidate as any);
    return result;
  };

  // Get fields for current tab
  const getFieldsForCurrentTab = () => {
    switch (activeTab) {
      case "basic":
        return ["title", "description"];
      case "discount":
        return [
          "discountType",
          "discountValue",
          "pointsRequired",
          "originalValue",
        ];
      case "validity":
        return ["validFrom", "validUntil"];
      default:
        return [];
    }
  };

  // Handle next tab
  const handleNext = async () => {
    const isValid = await isCurrentTabValid();
    if (isValid) {
      const tabs = ["basic", "discount", "validity", "advanced"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    }
  };

  // Handle previous tab
  const handlePrevious = () => {
    const tabs = ["basic", "discount", "validity", "advanced"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const onSubmit = async (data: UpdateCouponFormData) => {
    if (!coupon) return;

    // Clean up undefined values
    const cleanedData: any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateCouponFormData];
      if (value !== undefined && value !== null) {
        cleanedData[key] = value;
      }
    });

    await updateCoupon.mutateAsync({
      couponId: coupon._id,
      data: cleanedData,
    });
    onSuccess();
  };

  const isLastTab = activeTab === "advanced";
  const isFirstTab = activeTab === "basic";
  const isCouponRedeemed = (coupon?.totalRedemptions || 0) > 0;
  const isCouponUsed = coupon?.status === "used";

  // Don't allow editing if coupon is used
  if (isCouponUsed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Edit Used Coupon</DialogTitle>
            <DialogDescription>
              This coupon has already been used and cannot be edited. Used
              coupons are read-only.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Coupon
          </DialogTitle>
          <DialogDescription>
            Update the coupon details. Fields marked with * are required.
            {isCouponRedeemed && (
              <span className="mt-1 block text-yellow-600">
                ⚠️ This coupon has been redeemed {coupon?.totalRedemptions}{" "}
                times. Some value-related fields cannot be changed.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="discount">Discount & Points</TabsTrigger>
              <TabsTrigger value="validity">Validity & Limits</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4">
              {/* Coupon Type - Read Only */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel className="flex items-center gap-2 text-sm font-medium">
                    <Gift className="text-muted-foreground h-4 w-4" />
                    Coupon Type
                  </FieldLabel>
                  <div className="h-10 rounded-md border bg-gray-50 px-3 py-2 text-gray-700 capitalize">
                    {watch("couponType")}
                  </div>
                </FieldGroup>
              </Field>

              {/* College - Read Only */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel className="flex items-center gap-2 text-sm font-medium">
                    <Ticket className="text-muted-foreground h-4 w-4" />
                    College
                  </FieldLabel>
                  <div className="h-10 rounded-md border bg-gray-50 px-3 py-2 text-gray-700">
                    {collegesData?.data?.find(
                      (c: any) => c._id === watch("collegeId"),
                    )?.name || "Loading..."}
                  </div>
                </FieldGroup>
              </Field>

              {/* Title */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="title"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.title ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    Title *
                  </FieldLabel>
                  <Input
                    id="title"
                    placeholder="e.g., 20% Off on Lunch"
                    className="h-10"
                    {...register("title")}
                    aria-invalid={!!errors.title}
                  />
                </FieldGroup>
                {errors.title && (
                  <FieldError className="text-xs text-red-500">
                    {errors.title.message}
                  </FieldError>
                )}
              </Field>

              {/* Description */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="description"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.description ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    Description *
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe what this coupon offers..."
                    className="min-h-[100px]"
                    {...register("description")}
                    aria-invalid={!!errors.description}
                  />
                </FieldGroup>
                {errors.description && (
                  <FieldError className="text-xs text-red-500">
                    {errors.description.message}
                  </FieldError>
                )}
              </Field>

              {/* Canteen Name */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="canteenName"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Ticket className="text-muted-foreground h-4 w-4" />
                    Canteen/Cafeteria Name
                  </FieldLabel>
                  <Input
                    id="canteenName"
                    placeholder="e.g., Main Canteen, Coffee Shop"
                    className="h-10"
                    {...register("canteenName")}
                  />
                </FieldGroup>
              </Field>

              {/* Canteen Location */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="canteenLocation"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Location
                  </FieldLabel>
                  <Input
                    id="canteenLocation"
                    placeholder="e.g., Ground Floor, Block A"
                    className="h-10"
                    {...register("canteenLocation")}
                  />
                </FieldGroup>
              </Field>

              {/* Status */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="status"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Status
                  </FieldLabel>
                  <Select
                    onValueChange={(
                      value: "active" | "expired" | "cancelled",
                    ) => setValue("status", value)}
                    value={currentStatus}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentStatus === "cancelled" && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Cancelled coupons will not be available for redemption
                    </p>
                  )}
                </FieldGroup>
              </Field>
            </TabsContent>

            <TabsContent value="discount" className="mt-4 space-y-4">
              {/* Discount Type - Read Only if redeemed */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    Discount Type
                  </FieldLabel>
                  <div
                    className={`h-10 rounded-md border px-3 py-2 ${isCouponRedeemed ? "bg-gray-50" : "bg-white"} text-gray-700 capitalize`}
                  >
                    {watch("discountType") === "fixed"
                      ? "Fixed Amount ($)"
                      : "Percentage (%)"}
                  </div>
                </FieldGroup>
              </Field>

              {/* Discount Value */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="discountValue"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.discountValue ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    Discount Value{" "}
                    {discountType === "percentage" ? "(%)" : "($)"} *
                  </FieldLabel>
                  <Input
                    id="discountValue"
                    type="number"
                    step="1"
                    placeholder={
                      discountType === "percentage" ? "e.g., 20" : "e.g., 5"
                    }
                    className="h-10"
                    disabled={isCouponRedeemed}
                    {...register("discountValue", { valueAsNumber: true })}
                    aria-invalid={!!errors.discountValue}
                  />
                </FieldGroup>
                {errors.discountValue && (
                  <FieldError className="text-xs text-red-500">
                    {errors.discountValue.message}
                  </FieldError>
                )}
              </Field>

              {/* Maximum Discount (for percentage) */}
              {discountType === "percentage" && (
                <Field orientation="vertical" className="gap-0 space-y-0.5">
                  <FieldGroup className="gap-0 space-y-1">
                    <FieldLabel
                      htmlFor="maximumDiscount"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      Maximum Discount ($)
                    </FieldLabel>
                    <Input
                      id="maximumDiscount"
                      type="number"
                      step="1"
                      placeholder="e.g., 500"
                      className="h-10"
                      {...register("maximumDiscount", {
                        setValueAs: (v) =>
                          v === "" ? undefined : parseFloat(v),
                      })}
                    />
                  </FieldGroup>
                </Field>
              )}

              {/* Minimum Order Value */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="minimumOrderValue"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Minimum Order Value ($)
                  </FieldLabel>
                  <Input
                    id="minimumOrderValue"
                    type="number"
                    step="1"
                    placeholder="e.g., 100"
                    className="h-10"
                    {...register("minimumOrderValue", {
                      setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                    })}
                  />
                </FieldGroup>
              </Field>

              {/* Points Required */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="pointsRequired"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.pointsRequired ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${errors.pointsRequired ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Points Required *
                  </FieldLabel>
                  <Input
                    id="pointsRequired"
                    type="number"
                    step="10"
                    placeholder="e.g., 500"
                    className="h-10"
                    disabled={isCouponRedeemed}
                    {...register("pointsRequired", { valueAsNumber: true })}
                    aria-invalid={!!errors.pointsRequired}
                  />
                </FieldGroup>
                {errors.pointsRequired && (
                  <FieldError className="text-xs text-red-500">
                    {errors.pointsRequired.message}
                  </FieldError>
                )}
              </Field>

              {/* Original Value */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="originalValue"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.originalValue ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <DollarSign
                      className={`h-4 w-4 ${errors.originalValue ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Original Value ($) *
                  </FieldLabel>
                  <Input
                    id="originalValue"
                    type="number"
                    step="1"
                    placeholder="e.g., 1000"
                    className="h-10"
                    disabled={isCouponRedeemed}
                    {...register("originalValue", { valueAsNumber: true })}
                    aria-invalid={!!errors.originalValue}
                  />
                </FieldGroup>
                {errors.originalValue && (
                  <FieldError className="text-xs text-red-500">
                    {errors.originalValue.message}
                  </FieldError>
                )}
              </Field>
            </TabsContent>

            <TabsContent value="validity" className="mt-4 space-y-4">
              {/* Valid From */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="validFrom"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.validFrom ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 ${errors.validFrom ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Valid From *
                  </FieldLabel>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    className="h-10"
                    {...register("validFrom")}
                    aria-invalid={!!errors.validFrom}
                  />
                </FieldGroup>
                {errors.validFrom && (
                  <FieldError className="text-xs text-red-500">
                    {errors.validFrom.message}
                  </FieldError>
                )}
              </Field>

              {/* Valid Until */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="validUntil"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.validUntil ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 ${errors.validUntil ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Valid Until *
                  </FieldLabel>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    className="h-10"
                    {...register("validUntil")}
                    aria-invalid={!!errors.validUntil}
                  />
                </FieldGroup>
                {errors.validUntil && (
                  <FieldError className="text-xs text-red-500">
                    {errors.validUntil.message}
                  </FieldError>
                )}
              </Field>

              {/* Unlimited Quantity Switch */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FieldLabel className="flex items-center gap-2 text-base">
                      <Infinity className="h-4 w-4" />
                      Unlimited Quantity
                    </FieldLabel>
                    <p className="text-muted-foreground text-sm">
                      Allow unlimited number of users to claim this coupon
                    </p>
                  </div>
                  <Switch
                    checked={isUnlimited}
                    onCheckedChange={(checked) =>
                      setValue("isUnlimited", checked)
                    }
                  />
                </div>
              </Field>

              {/* Total Quantity (only if not unlimited) */}
              {!isUnlimited && (
                <Field orientation="vertical" className="gap-0 space-y-0.5">
                  <FieldGroup className="gap-0 space-y-1">
                    <FieldLabel
                      htmlFor="totalQuantity"
                      className={`flex items-center gap-2 text-sm font-medium ${
                        errors.totalQuantity
                          ? "text-red-500"
                          : "text-foreground"
                      }`}
                    >
                      Total Quantity *
                    </FieldLabel>
                    <Input
                      id="totalQuantity"
                      type="number"
                      step="1"
                      placeholder="e.g., 100"
                      className="h-10"
                      {...register("totalQuantity", {
                        setValueAs: (v) =>
                          v === "" ? undefined : parseFloat(v),
                      })}
                      aria-invalid={!!errors.totalQuantity}
                    />
                  </FieldGroup>
                  {errors.totalQuantity && (
                    <FieldError className="text-xs text-red-500">
                      {errors.totalQuantity.message}
                    </FieldError>
                  )}
                </Field>
              )}

              {/* Redemption Method */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="redemptionMethod"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Redemption Method
                  </FieldLabel>
                  <Select
                    onValueChange={(value: "qr" | "code" | "manual") =>
                      setValue("redemptionMethod", value)
                    }
                    value={watch("redemptionMethod")}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select redemption method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Coupon Code Only</SelectItem>
                      <SelectItem value="qr">QR Code</SelectItem>
                      <SelectItem value="manual">
                        Manual Verification
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </Field>

              {/* User Limit Per Coupon */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="userLimitPerCoupon"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    User Limit Per Coupon
                  </FieldLabel>
                  <Input
                    id="userLimitPerCoupon"
                    type="number"
                    step="1"
                    placeholder="e.g., 1"
                    className="h-10"
                    {...register("userLimitPerCoupon", {
                      setValueAs: (v) => (v === "" ? 1 : parseFloat(v)),
                    })}
                  />
                </FieldGroup>
              </Field>
            </TabsContent>

            <TabsContent value="advanced" className="mt-4 space-y-4">
              {/* Featured Switch */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FieldLabel className="flex items-center gap-2 text-base">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Featured Coupon
                    </FieldLabel>
                    <p className="text-muted-foreground text-sm">
                      Show this coupon at the top of the list
                    </p>
                  </div>
                  <Switch
                    checked={watch("isFeatured")}
                    onCheckedChange={(checked) =>
                      setValue("isFeatured", checked)
                    }
                  />
                </div>
              </Field>

              {/* Sort Order */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="sortOrder"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Sort Order
                  </FieldLabel>
                  <Input
                    id="sortOrder"
                    type="number"
                    step="1"
                    placeholder="e.g., 0"
                    className="h-10"
                    {...register("sortOrder", {
                      setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                    })}
                  />
                </FieldGroup>
              </Field>

              {/* Daily Usage Limit */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="dailyUsageLimit"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Daily Usage Limit
                  </FieldLabel>
                  <Input
                    id="dailyUsageLimit"
                    type="number"
                    step="1"
                    placeholder="e.g., 50"
                    className="h-10"
                    {...register("dailyUsageLimit", {
                      setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                    })}
                  />
                </FieldGroup>
              </Field>

              {/* Weekly Usage Limit */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="weeklyUsageLimit"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Weekly Usage Limit
                  </FieldLabel>
                  <Input
                    id="weeklyUsageLimit"
                    type="number"
                    step="1"
                    placeholder="e.g., 300"
                    className="h-10"
                    {...register("weeklyUsageLimit", {
                      setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                    })}
                  />
                </FieldGroup>
              </Field>

              {/* Instructions */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="instructions"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Usage Instructions
                  </FieldLabel>
                  <Textarea
                    id="instructions"
                    placeholder="How to use this coupon..."
                    className="min-h-[80px]"
                    {...register("instructions")}
                  />
                </FieldGroup>
              </Field>

              {/* Terms and Conditions */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="termsAndConditions"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    Terms & Conditions
                  </FieldLabel>
                  <Textarea
                    id="termsAndConditions"
                    placeholder="Enter terms and conditions (one per line)"
                    className="min-h-[80px]"
                    {...register("termsAndConditions", {
                      setValueAs: (v) => {
                        if (typeof v === "string") {
                          return v
                            .split("\n")
                            .filter((line) => line.trim() !== "");
                        }
                        return v || [];
                      },
                    })}
                  />
                </FieldGroup>
              </Field>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={isFirstTab ? () => onOpenChange(false) : handlePrevious}
            >
              {isFirstTab ? "Cancel" : "Previous"}
            </Button>

            {!isLastTab ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Coupon"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
