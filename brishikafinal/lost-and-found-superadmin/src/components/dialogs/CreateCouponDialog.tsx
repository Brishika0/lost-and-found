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
import { useCreateCoupon } from "@/hooks/useCoupon";
import {
  Gift,
  Ticket,
  Calendar,
  DollarSign,
  Star,
  Infinity,
} from "lucide-react";
import { couponSchema, type CouponFormData } from "@/schema/coupon.schema";
import { useGetColleges } from "@/hooks/useColleges";
import type { CreateCouponRequest } from "@/types/coupon.types";

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCouponDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCouponDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const { data: collegesData } = useGetColleges({
    page: 1,
    limit: 100,
  });

  const createCoupon = useCreateCoupon();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema) as any,
    mode: "onChange", // Enable validation on change
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
      imageUrl: "",
      isFeatured: false,
      sortOrder: 0,
    },
  });

  const isUnlimited = watch("isUnlimited");
  const discountType = watch("discountType");

  // Set default dates when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Format dates without timezone offset
      const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      reset({
        couponType: "canteen",
        title: "",
        description: "",
        discountType: "fixed",
        discountValue: 0,
        pointsRequired: 0,
        originalValue: 0,
        validFrom: formatLocalDateTime(now),
        validUntil: formatLocalDateTime(futureDate),
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
        imageUrl: "",
        isFeatured: false,
        sortOrder: 0,
      });
      setActiveTab("basic");
    }
  }, [open, reset]);

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
        return ["couponType", "title", "description", "collegeId"];
      case "discount":
        return [
          "discountType",
          "discountValue",
          "pointsRequired",
          "originalValue",
        ];
      case "validity":
        return ["validFrom", "validUntil", "isUnlimited", "totalQuantity"];
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

  // Transform form data to match CreateCouponRequest type
  const transformToRequest = (
    formData: CouponFormData,
  ): CreateCouponRequest => {
    return {
      couponType: formData.couponType,
      title: formData.title,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      pointsRequired: formData.pointsRequired,
      originalValue: formData.originalValue,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      isUnlimited: formData.isUnlimited,
      totalQuantity: formData.totalQuantity,
      collegeId: formData.collegeId,
      canteenName: formData.canteenName || undefined,
      canteenLocation: formData.canteenLocation || undefined,
      minimumOrderValue: formData.minimumOrderValue,
      maximumDiscount: formData.maximumDiscount || undefined,
      redemptionMethod: formData.redemptionMethod,
      userLimitPerCoupon: formData.userLimitPerCoupon,
      dailyUsageLimit: formData.dailyUsageLimit || undefined,
      weeklyUsageLimit: formData.weeklyUsageLimit || undefined,
      allowedItems: formData.allowedItems,
      termsAndConditions: formData.termsAndConditions,
      instructions: formData.instructions || undefined,
      imageUrl: undefined, // Remove image URL
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder,
    };
  };

  const onSubmit = async (data: CouponFormData) => {
    const requestData = transformToRequest(data);
    await createCoupon.mutateAsync(requestData);
    onSuccess();
  };

  const isLastTab = activeTab === "advanced";
  const isFirstTab = activeTab === "basic";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Create New Coupon
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new coupon for students to redeem
            with their points
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
              {/* College Selection */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="collegeId"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.collegeId ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Ticket
                      className={`h-4 w-4 ${errors.collegeId ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    College *
                  </FieldLabel>
                  <Select
                    onValueChange={(value) => setValue("collegeId", value)}
                    value={watch("collegeId")}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegesData?.data?.map((college: any) => (
                        <SelectItem key={college._id} value={college._id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
                {errors.collegeId && (
                  <FieldError className="text-xs text-red-500">
                    {errors.collegeId.message}
                  </FieldError>
                )}
              </Field>

              {/* Coupon Type */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="couponType"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.couponType ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Gift
                      className={`h-4 w-4 ${errors.couponType ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Coupon Type *
                  </FieldLabel>
                  <Select
                    onValueChange={(
                      value:
                        | "canteen"
                        | "cafeteria"
                        | "meal"
                        | "snack"
                        | "beverage",
                    ) => setValue("couponType", value)}
                    value={watch("couponType")}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select coupon type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="canteen">Canteen</SelectItem>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                {errors.couponType && (
                  <FieldError className="text-xs text-red-500">
                    {errors.couponType.message}
                  </FieldError>
                )}
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
            </TabsContent>

            <TabsContent value="discount" className="mt-4 space-y-4">
              {/* Discount Type */}
              <Field orientation="vertical" className="gap-0 space-y-0.5">
                <FieldGroup className="gap-0 space-y-1">
                  <FieldLabel
                    htmlFor="discountType"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      errors.discountType ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <DollarSign
                      className={`h-4 w-4 ${errors.discountType ? "text-red-500" : "text-muted-foreground"}`}
                    />
                    Discount Type *
                  </FieldLabel>
                  <Select
                    onValueChange={(value: "fixed" | "percentage") =>
                      setValue("discountType", value)
                    }
                    value={watch("discountType")}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                {errors.discountType && (
                  <FieldError className="text-xs text-red-500">
                    {errors.discountType.message}
                  </FieldError>
                )}
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
                {isSubmitting ? "Creating..." : "Create Coupon"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
