import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  categories,
  createLostItemSchema,
  updateLostItemSchema,
} from "@/schema/lostItem.schema";
import type z from "zod";
import {
  ImageIcon,
  Upload,
  Star,
  X,
  Loader2,
  MapPin,
  Info,
  AlertCircle,
  Calendar,
  Tag,
  Phone,
  Camera,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetZones } from "@/hooks/useZones";
import type { LostItem } from "@/types/lostItem.types";
import { useCreateLostItem, useUpdateLostItem } from "@/hooks/useLostItems";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LostItemFormProps {
  initialData?: LostItem;
}

interface ImageData {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  file?: File;
}

export function LostItemForm({ initialData }: LostItemFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [imagePreviews, setImagePreviews] = useState<ImageData[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateLostItem();
  const updateMutation = useUpdateLostItem();

  const formSchema = isEditMode ? updateLostItemSchema : createLostItemSchema;
  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      itemName: initialData?.itemName || "",
      description: initialData?.description || "",
      category: initialData?.category || ("Other" as any),
      subCategory: initialData?.subCategory || "",
      status: initialData?.status || ("lost" as any),
      locationDescription: initialData?.locationDescription || "",
      zoneId: initialData?.zoneId?._id || "",
      dateLost: initialData?.dateLost || undefined,
      dateFound: initialData?.dateFound || undefined,
      contactInfo: {
        phone: initialData?.contactInfo?.phone || "",
        email: initialData?.contactInfo?.email || "",
        preferredContact: initialData?.contactInfo?.preferredContact || "both",
        showContact: initialData?.contactInfo?.showContact ?? true,
      },
      tags: initialData?.tags || [],
    },
    mode: "onChange",
  });

  const tags = watch("tags");
  const status = watch("status");
  const zoneId = watch("zoneId");

  const { data: zonesList, isLoading: zonesLoading } = useGetZones({
    limit: 20,
    isActive: true,
  });

  // Load existing images for edit mode
  useEffect(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      const existingImages = initialData.images.map((img: any, idx) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: idx === 0,
      }));
      setImagePreviews(existingImages);
    }
  }, [initialData]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const validFiles = files.filter((file) => {
        const isValidSize = file.size <= 5 * 1024 * 1024;
        const isValidType = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type);

        if (!isValidSize) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          return false;
        }
        if (!isValidType) {
          toast.error(`File ${file.name} has invalid format`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setSubmitError(
          "Please upload valid image files (JPEG, PNG, GIF, WebP, max 5MB)",
        );
        return;
      }

      const totalImages = imagePreviews.length + validFiles.length;
      if (totalImages > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const newImages = validFiles.map((file, idx) => ({
        file,
        url: URL.createObjectURL(file),
        isPrimary: imagePreviews.length === 0 && idx === 0,
      }));

      setImagePreviews((prev) => [...prev, ...newImages]);
      setImageFiles((prev) => [...prev, ...validFiles]);
      // clearErrors("images");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [imagePreviews.length, clearErrors],
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      if (
        imagePreviews[index]?.url &&
        imagePreviews[index]?.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreviews[index].url);
      }

      setImagePreviews((prev) => {
        const newPreviews = prev.filter((_, i) => i !== index);
        if (prev[index]?.isPrimary && newPreviews.length > 0) {
          return newPreviews.map((img, idx) => ({
            ...img,
            isPrimary: idx === 0,
          }));
        }
        return newPreviews;
      });

      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [imagePreviews],
  );

  const handleSetPrimary = useCallback(
    (index: number) => {
      if (index === 0) return;

      const newPreviews = [...imagePreviews];
      const [selectedPreview] = newPreviews.splice(index, 1);
      newPreviews.unshift({ ...selectedPreview, isPrimary: true });
      const updatedPreviews = newPreviews.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
      setImagePreviews(updatedPreviews);

      const newFiles = [...imageFiles];
      const [selectedFile] = newFiles.splice(index, 1);
      newFiles.unshift(selectedFile);
      setImageFiles(newFiles);

      toast.success("Primary image updated");
    },
    [imagePreviews, imageFiles],
  );

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const input = e.currentTarget;
        const newTag = input.value.trim();
        if (newTag && !tags?.includes(newTag)) {
          const updatedTags = [...(tags || []), newTag];
          setValue("tags", updatedTags, {
            shouldValidate: true,
            shouldDirty: true,
          });
          input.value = "";
        }
      }
    },
    [tags, setValue],
  );

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = tags?.filter((tag) => tag !== tagToRemove) || [];
      setValue("tags", updatedTags, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [tags, setValue],
  );

  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      setSubmitError("");

      try {
        // Log form values for debugging
        console.log("Form submitted with values:", values);
        console.log("Images to upload:", imageFiles.length);

        // Prepare the data for submission
        const submitData: any = {};

        // Add basic fields (only if they exist and are not empty)
        if (values.itemName) submitData.itemName = values.itemName;
        if (values.description) submitData.description = values.description;
        if (values.category) submitData.category = values.category;
        if (values.subCategory) submitData.subCategory = values.subCategory;
        if (values.status) submitData.status = values.status;
        if (values.locationDescription)
          submitData.locationDescription = values.locationDescription;
        if (values.zoneId) submitData.zoneId = values.zoneId;
        if (values.tags && values.tags.length > 0)
          submitData.tags = values.tags;

        // Handle contactInfo
        if (values.contactInfo) {
          const contact: any = {};

          if (values.contactInfo.phone)
            contact.phone = values.contactInfo.phone;
          if (values.contactInfo.email)
            contact.email = values.contactInfo.email;
          if (values.contactInfo.preferredContact)
            contact.preferredContact = values.contactInfo.preferredContact;
          if (values.contactInfo.showContact !== undefined)
            contact.showContact = values.contactInfo.showContact;

          if (Object.keys(contact).length > 0) {
            submitData.contactInfo = contact;
          }
        }

        // Handle dates based on status
        if (values.status === "lost" && values.dateLost) {
          submitData.dateLost = values.dateLost;
        } else if (values.status === "found" && values.dateFound) {
          submitData.dateFound = values.dateFound;
        }

        console.log(
          "Final submission data:",
          JSON.stringify(submitData, null, 2),
        );

        if (isEditMode && initialData) {
          // Update existing item
          await updateMutation.mutateAsync({
            id: initialData._id,
            data: submitData,
            images: imageFiles.length > 0 ? imageFiles : undefined,
          });
          navigate("/");
        } else {
          // Create new item
          await createMutation.mutateAsync({
            data: submitData,
            images: imageFiles,
          });
          navigate("/");
        }
      } catch (error: any) {
        console.error("Form submission error:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to submit form";
        setSubmitError(errorMessage);
      }
    },
    [
      imageFiles,
      isEditMode,
      initialData,
      createMutation,
      updateMutation,
      navigate,
    ],
  );

  const handleZoneIdChange = (value: string) => {
    setValue("zoneId", value);
    clearErrors("zoneId");
  };

  const getTodayDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  const isLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Error Alert */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="text-primary h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">Item Details</FieldLegend>
                <FieldDescription>
                  Provide basic information about the item
                </FieldDescription>

                <FieldGroup className="gap-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="itemName">
                      Item Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="itemName"
                      placeholder="e.g., Black Leather Wallet"
                      {...register("itemName")}
                      aria-invalid={!!errors.itemName}
                      disabled={isLoading}
                      className={cn(errors.itemName && "border-red-500")}
                    />
                    {errors.itemName && (
                      <FieldError>{errors.itemName.message}</FieldError>
                    )}
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Describe color, brand, unique features..."
                      className="min-h-[100px]"
                      {...register("description")}
                      aria-invalid={!!errors.description}
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <FieldError>{errors.description.message}</FieldError>
                    )}
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel htmlFor="category">
                        Category <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Select
                        value={watch("category")}
                        onValueChange={(value) => {
                          setValue("category", value as any, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <FieldError>{errors.category.message}</FieldError>
                      )}
                    </Field>

                    <Field className="gap-1">
                      <FieldLabel htmlFor="subCategory">
                        Sub Category
                      </FieldLabel>
                      <Input
                        id="subCategory"
                        placeholder="e.g., Smartphone"
                        {...register("subCategory")}
                        disabled={isLoading}
                      />
                    </Field>
                  </div>

                  <Field className="pb-3">
                    <FieldLabel>
                      Status <span className="text-red-500">*</span>
                    </FieldLabel>
                    <RadioGroup
                      value={watch("status")}
                      onValueChange={(value) => {
                        setValue("status", value as any, {
                          shouldValidate: true,
                        });
                      }}
                      className="flex gap-4"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lost" id="lost" />
                        <FieldLabel
                          htmlFor="lost"
                          className="cursor-pointer font-normal"
                        >
                          Lost
                        </FieldLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="found" id="found" />
                        <FieldLabel
                          htmlFor="found"
                          className="cursor-pointer font-normal"
                        >
                          Found
                        </FieldLabel>
                      </div>
                    </RadioGroup>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="text-primary h-4 w-4" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">
                  Where was the item lost/found?
                </FieldLegend>
                <FieldDescription>
                  Provide accurate location information to help others
                </FieldDescription>

                <FieldGroup className="gap-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="locationDescription">
                      Location Description{" "}
                      <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Textarea
                      id="locationDescription"
                      placeholder="Describe where the item was lost/found..."
                      className="min-h-[80px]"
                      {...register("locationDescription")}
                      aria-invalid={!!errors.locationDescription}
                      disabled={isLoading}
                    />
                    {errors.locationDescription && (
                      <FieldError>
                        {errors.locationDescription.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="zoneId">Zone / Area</FieldLabel>
                    <Select
                      value={zoneId || ""}
                      onValueChange={handleZoneIdChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="zoneId">
                        <SelectValue placeholder="Select Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {zonesList?.data?.map((zone) => (
                            <SelectItem key={zone._id} value={zone._id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Date Information */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="text-primary h-4 w-4" />
              Date Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">
                  When did this happen?
                </FieldLegend>
                <FieldDescription>
                  Providing a date helps with tracking (Optional)
                </FieldDescription>

                {status === "lost" && (
                  <Field className="gap-1">
                    <FieldLabel htmlFor="dateLost">Date Lost</FieldLabel>
                    <Input
                      id="dateLost"
                      type="datetime-local"
                      defaultValue={getTodayDate()}
                      {...register("dateLost")}
                      disabled={isLoading}
                    />
                    <FieldDescription>
                      When was the item lost? (Optional)
                    </FieldDescription>
                  </Field>
                )}

                {status === "found" && (
                  <Field className="gap-1">
                    <FieldLabel htmlFor="dateFound">Date Found</FieldLabel>
                    <Input
                      id="dateFound"
                      type="datetime-local"
                      defaultValue={getTodayDate()}
                      {...register("dateFound")}
                      disabled={isLoading}
                    />
                    <FieldDescription>
                      When was the item found? (Optional)
                    </FieldDescription>
                  </Field>
                )}
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="text-primary h-4 w-4" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">Upload Photos</FieldLegend>
                <FieldDescription>
                  Add clear photos to help identify the item{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </FieldDescription>

                <Field className="gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {imagePreviews.length}/5
                      </Badge>
                      {imagePreviews.some((img) => img.isPrimary) && (
                        <Badge variant="outline">⭐ Primary selected</Badge>
                      )}
                    </div>
                    {imagePreviews.length < 5 && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Add Images
                        </Button>
                      </>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {imagePreviews.map((img, idx) => (
                        <div
                          key={img.publicId || idx}
                          className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-50"
                        >
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7"
                              onClick={() => handleSetPrimary(idx)}
                              disabled={img.isPrimary}
                            >
                              <Star
                                className={cn(
                                  "h-3 w-3",
                                  img.isPrimary &&
                                    "fill-yellow-500 text-yellow-500",
                                )}
                              />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={() => handleRemoveImage(idx)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {img.isPrimary && (
                            <div className="absolute top-1 left-1 rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-medium text-white">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length === 0 && (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                      <Camera className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">
                        No images uploaded
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Upload up to 5 images (max 5MB each)
                      </p>
                    </div>
                  )}
                </Field>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="text-primary h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">How to reach you?</FieldLegend>
                <FieldDescription>
                  Provide contact details so people can reach you
                </FieldDescription>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      id="phone"
                      placeholder="+1234567890"
                      {...register("contactInfo.phone")}
                      aria-invalid={!!errors.contactInfo?.phone}
                      disabled={isLoading}
                    />
                    {errors.contactInfo?.phone && (
                      <FieldError>
                        {errors.contactInfo.phone.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...register("contactInfo.email")}
                      aria-invalid={!!errors.contactInfo?.email}
                      disabled={isLoading}
                    />
                    {errors.contactInfo?.email && (
                      <FieldError>
                        {errors.contactInfo.email.message}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <Field className="gap-1">
                  <FieldLabel>Preferred Contact Method</FieldLabel>
                  <RadioGroup
                    value={watch("contactInfo.preferredContact")}
                    onValueChange={(value) =>
                      setValue("contactInfo.preferredContact", value as any)
                    }
                    className="flex gap-4"
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="pref-phone" />
                      <FieldLabel
                        htmlFor="pref-phone"
                        className="cursor-pointer font-normal"
                      >
                        Phone
                      </FieldLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="pref-email" />
                      <FieldLabel
                        htmlFor="pref-email"
                        className="cursor-pointer font-normal"
                      >
                        Email
                      </FieldLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="pref-both" />
                      <FieldLabel
                        htmlFor="pref-both"
                        className="cursor-pointer font-normal"
                      >
                        Both
                      </FieldLabel>
                    </div>
                  </RadioGroup>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="showContact"
                    checked={watch("contactInfo.showContact")}
                    onCheckedChange={(checked) =>
                      setValue("contactInfo.showContact", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="space-y-0.5">
                    <FieldLabel
                      htmlFor="showContact"
                      className="cursor-pointer font-normal"
                    >
                      Show Contact Information Publicly
                    </FieldLabel>
                    <FieldDescription>
                      Uncheck to keep your contact details private
                    </FieldDescription>
                  </div>
                </Field>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="gap-1 py-2">
          <CardHeader className="bg-muted/30 m-0 border-b p-0 px-3 [.border-b]:pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="text-primary h-4 w-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldLegend className="mb-0.5">Add Keywords</FieldLegend>
                <FieldDescription>
                  Add relevant tags to help others find this item
                </FieldDescription>

                <Field>
                  <Input
                    placeholder="Type tag and press Enter"
                    onKeyDown={handleAddTag}
                    disabled={isLoading}
                  />
                  {tags && tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          #{tag}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FieldDescription>
                    💡 Add tags like: urgent, valuable, electronics
                  </FieldDescription>
                </Field>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="bg-background/95 sticky bottom-0 z-[999] flex gap-3 px-4 py-4 backdrop-blur-sm">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditMode ? "Update Item" : "Create Item"}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
