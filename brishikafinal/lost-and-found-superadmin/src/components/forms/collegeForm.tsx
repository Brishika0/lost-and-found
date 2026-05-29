import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { College } from "@/types/college";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  createCollegeSchema,
  updateCollegeSchema,
  type CollegeFormData,
  type CreateCollegeFormData,
  type UpdateCollegeFormData,
} from "@/schema/college.schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProvienceAndCityData from "@/assets/proviences&cities.json";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useCreateCollege, useUpdateCollege } from "@/hooks/useColleges";
import {
  defaultCenter,
  LocationMarker,
  mapContainerStyle,
} from "@/utils/leafletHelper";
import { useNavigate } from "react-router-dom";

interface CollegeFormProps {
  initialData?: College | null;
}

export function CollegeForm({ initialData }: CollegeFormProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mapPosition, setMapPosition] =
    useState<[number, number]>(defaultCenter);
  const [isMapReady, setIsMapReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isUserAction = useRef(false);
  const navigate = useNavigate();

  const createCollege = useCreateCollege();
  const updateCollege = useUpdateCollege();

  // Choose schema based on mode
  const schema = initialData ? updateCollegeSchema : createCollegeSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    clearErrors,
  } = useForm<CollegeFormData | CreateCollegeFormData | UpdateCollegeFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          shortName: initialData.shortName,
          domain: initialData.domain,
          logo: initialData.logo,
          location: {
            address: initialData.location?.address || "",
            city: initialData.location?.city || "",
            state: initialData.location?.state || "",
            country: initialData.location?.country || "Nepal",
            coordinates: initialData.location?.coordinates || [85.324, 27.7172],
          },
          contactInfo: {
            email: initialData.contactInfo?.email || "",
            phone: initialData.contactInfo?.phone || "",
            website: initialData.contactInfo?.website || "",
          },
        }
      : {
          name: "",
          shortName: "",
          domain: "",
          logo: undefined,
          location: {
            address: "",
            city: "",
            state: "",
            country: "Nepal",
            coordinates: [85.324, 27.7172], // [lng, lat]
          },
          contactInfo: {
            email: "",
            phone: "",
            website: "",
          },
        },
  });

  const selectedState = watch("location.state");
  const selectedCity = watch("location.city");
  const coordinates = watch("location.coordinates");

  // Memoize provinces list to prevent unnecessary re-renders
  const provincesList = useMemo(() => {
    return ProvienceAndCityData.provinces.map(({ id, name }) => ({
      id: id.toString(),
      name,
    }));
  }, []);

  // Memoize getCitiesByProvince function
  const getCitiesByProvince = useCallback((provinceId: string) => {
    if (!provinceId) return [];
    const province = ProvienceAndCityData.provinces.find(
      (p) => p.id === parseInt(provinceId),
    );
    return province ? province.cities : [];
  }, []);

  // Update map when coordinates change from form (external updates)
  useEffect(() => {
    if (coordinates && coordinates.length === 2 && !isUserAction.current) {
      setMapPosition([coordinates[1], coordinates[0]]);
    }
  }, [coordinates]);

  // Handle map position change from user interaction
  const handleMapPositionChange = useCallback(
    (newPosition: [number, number]) => {
      isUserAction.current = true;
      setMapPosition(newPosition);
      setValue("location.coordinates", [newPosition[1], newPosition[0]], {
        shouldValidate: true,
      });
      // Reset the flag after a short delay
      setTimeout(() => {
        isUserAction.current = false;
      }, 100);
    },
    [setValue],
  );

  useEffect(() => {
    if (initialData) {
      setImagePreview(initialData.logo.url);
    }

    // Small delay to ensure map is ready
    setTimeout(() => setIsMapReady(true), 100);
  }, [initialData]);

  const handleStateChange = (value: string) => {
    setValue("location.state", value);
    setValue("location.city", "");
    clearErrors("location.state");
    clearErrors("location.city");
  };

  const handleCityChange = (value: string) => {
    setValue("location.city", value);
    clearErrors("location.city");
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);

    if (!initialData) {
      // For create mode - set the file directly
      setValue("logo", file as any);
    } else {
      // For update mode - we'll handle in form submission
      // Just store the file for now
    }
    clearErrors("logo");
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (initialData) {
        // UPDATE MODE
        const updateData: any = {
          name: values.name,
          shortName: values.shortName,
          domain: values.domain,
          location: values.location,
          contactInfo: values.contactInfo,
        };

        // Only include logo if user uploaded a new file
        if (imageFile) {
          updateData.logo = imageFile;
        }

        await updateCollege.mutateAsync(
          {
            id: initialData._id,
            data: updateData,
          },
          {
            onSuccess: () => navigate("/colleges"),
          },
        );
      } else {
        // CREATE MODE - ensure logo is a File
        if (!imageFile) {
          throw new Error("Please select a logo image");
        }

        const createData: any = {
          name: values.name,
          shortName: values.shortName,
          domain: values.domain,
          logo: imageFile,
          location: values.location,
          contactInfo: values.contactInfo,
        };

        await createCollege.mutateAsync(createData, {
          onSuccess: () => navigate("/colleges"),
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mx-auto space-y-4 pb-12"
    >
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold">
          {initialData ? "Edit College" : "Add New College"}
        </h2>

        {/* College Name */}
        <div className="space-y-4">
          <Field orientation="vertical" className="gap-0 space-y-1">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel htmlFor="name" className="text-sm font-medium">
                College Name
              </FieldLabel>
              <Input
                id="name"
                placeholder="Example University"
                {...register("name")}
                aria-invalid={!!errors.name}
                disabled={isSubmitting}
              />
            </FieldGroup>
            {errors.name && (
              <FieldError className="flex items-center justify-end text-xs text-red-500">
                {errors.name.message}
              </FieldError>
            )}
          </Field>

          {/* Short Name and Domain */}
          <div className="grid grid-cols-2 gap-4">
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="shortName" className="text-sm font-medium">
                  Short Name
                </FieldLabel>
                <Input
                  id="shortName"
                  placeholder="EU"
                  {...register("shortName")}
                  aria-invalid={!!errors.shortName}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.shortName && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.shortName.message}
                </FieldError>
              )}
            </Field>

            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="domain" className="text-sm font-medium">
                  Domain
                </FieldLabel>
                <Input
                  id="domain"
                  placeholder="example.edu.np"
                  {...register("domain")}
                  aria-invalid={!!errors.domain}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.domain && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.domain.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* Image Upload */}
          <Field orientation="vertical" className="gap-0 space-y-1">
            <FieldGroup className="gap-0 space-y-1">
              <FieldLabel htmlFor="logo" className="text-sm font-medium">
                College Logo
              </FieldLabel>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {initialData
                  ? "Leave empty to keep current logo. Upload new image to replace."
                  : "Upload college logo (JPEG, PNG, GIF)"}
              </p>
            </FieldGroup>
            {!initialData && (
              <FieldError className="flex items-center justify-end text-xs text-red-500">
                Logo is required
              </FieldError>
            )}
          </Field>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Location Details</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Address */}
          <div className="md:col-span-2">
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="address" className="text-sm font-medium">
                  Street Address
                </FieldLabel>
                <Input
                  id="address"
                  placeholder="123 Main St"
                  {...register("location.address")}
                  aria-invalid={!!errors.location?.address}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.location?.address && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.location?.address?.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* Province/State Dropdown */}
          <div>
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="state" className="text-sm font-medium">
                  Province
                </FieldLabel>
                <Select
                  value={selectedState}
                  onValueChange={handleStateChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger size="lg" className="w-full py-2">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {provincesList.map((province) => (
                        <SelectItem
                          key={`province-${province.id}`}
                          value={province.id}
                        >
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldGroup>
              {errors.location?.state && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.location?.state?.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* City Dropdown */}
          <div>
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="city" className="text-sm font-medium">
                  City
                </FieldLabel>
                <Select
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  disabled={!selectedState || isSubmitting}
                >
                  <SelectTrigger size="lg" className="w-full py-2">
                    <SelectValue
                      placeholder={
                        !selectedState ? "Select province first" : "Select City"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectedState &&
                        getCitiesByProvince(selectedState).map(
                          (city, index) => (
                            <SelectItem
                              key={`city-${index}-${city}`}
                              value={city}
                            >
                              {city}
                            </SelectItem>
                          ),
                        )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldGroup>
              {errors.location?.city && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.location?.city?.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* Country */}
          <div className="md:col-span-2">
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="country" className="text-sm font-medium">
                  Country
                </FieldLabel>
                <Input
                  id="country"
                  value="Nepal"
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
                <input
                  type="hidden"
                  {...register("location.country")}
                  value="Nepal"
                />
              </FieldGroup>
            </Field>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="mt-4 space-y-2">
          <FieldLabel className="text-sm font-medium">
            Location on Map
          </FieldLabel>
          <p className="text-muted-foreground mb-2 text-xs">
            Click on the map or drag the marker to set exact location
          </p>

          {isMapReady && typeof window !== "undefined" && (
            <MapContainer
              key="map-container"
              center={mapPosition}
              zoom={13}
              style={mapContainerStyle}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                position={mapPosition}
                onPositionChange={handleMapPositionChange}
              />
            </MapContainer>
          )}

          {/* Coordinates Display */}
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Longitude</label>
              <Input
                type="number"
                step="any"
                value={coordinates?.[0]?.toFixed(6) || ""}
                readOnly
                className="bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Latitude</label>
              <Input
                type="number"
                step="any"
                value={coordinates?.[1]?.toFixed(6) || ""}
                readOnly
                className="bg-gray-50 text-sm"
              />
            </div>
          </div>

          <input
            type="hidden"
            {...register("location.coordinates.0", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("location.coordinates.1", { valueAsNumber: true })}
          />

          {errors.location?.coordinates && (
            <FieldError className="flex items-center justify-end text-xs text-red-500">
              {errors.location?.coordinates?.message}
            </FieldError>
          )}
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Contact Information</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="md:col-span-2">
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@college.edu.np"
                  {...register("contactInfo.email")}
                  aria-invalid={!!errors.contactInfo?.email}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.contactInfo?.email && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.contactInfo?.email?.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* Phone */}
          <div>
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="phone" className="text-sm font-medium">
                  Phone
                </FieldLabel>
                <Input
                  id="phone"
                  placeholder="+977-1-1234567"
                  {...register("contactInfo.phone")}
                  aria-invalid={!!errors.contactInfo?.phone}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.contactInfo?.phone && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.contactInfo?.phone?.message}
                </FieldError>
              )}
            </Field>
          </div>

          {/* Website */}
          <div>
            <Field orientation="vertical" className="gap-0 space-y-1">
              <FieldGroup className="gap-0 space-y-1">
                <FieldLabel htmlFor="website" className="text-sm font-medium">
                  Website
                </FieldLabel>
                <Input
                  id="website"
                  placeholder="https://www.college.edu.np"
                  {...register("contactInfo.website")}
                  aria-invalid={!!errors.contactInfo?.website}
                  disabled={isSubmitting}
                />
              </FieldGroup>
              {errors.contactInfo?.website && (
                <FieldError className="flex items-center justify-end text-xs text-red-500">
                  {errors.contactInfo?.website?.message}
                </FieldError>
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {initialData ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>{initialData ? "Update College" : "Create College"}</>
        )}
      </Button>
    </form>
  );
}
