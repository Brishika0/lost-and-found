import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MapPin, Layers, Tag, Loader2 } from "lucide-react";
import {
  createZoneSchema,
  updateZoneSchema,
  type CreateZoneInput,
  type UpdateZoneInput,
} from "@/schema/zone.schema";
import { ZONE_TYPE_OPTIONS } from "@/types/zone.types";
import { useCreateZone, useUpdateZone, useGetZones } from "@/hooks/useZones";
import type { Zone } from "@/types/zone.types";

// Leaflet Map imports
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const mapContainerStyle = {
  height: "300px",
  width: "100%",
  borderRadius: "0.5rem",
  zIndex: 1,
};

// Default center (Kathmandu)
const defaultCenter: [number, number] = [27.7172, 85.324];

interface LocationMarkerProps {
  position: [number, number] | null;
  onPositionChange: (position: [number, number]) => void;
}

function LocationMarker({ position, onPositionChange }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          onPositionChange([
            e.target.getLatLng().lat,
            e.target.getLatLng().lng,
          ]);
        },
      }}
    />
  ) : null;
}

interface ZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone | null;
  collegeId?: string;
  onSuccess?: () => void;
}

export function ZoneFormDialog({
  open,
  onOpenChange,
  zone,
  collegeId: preselectedCollegeId,
  onSuccess,
}: ZoneFormDialogProps) {
  const { user } = useAuth();
  const isEditMode = !!zone;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);
  const [roomInput, setRoomInput] = useState("");
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const isUserAction = useRef(false);

  const createZone = useCreateZone();
  const updateZone = useUpdateZone();

  // Fetch zones for parent zone selection
  const { data: zonesData, isLoading: isZonesLoading } = useGetZones({
    collegeId: user?.college?.id,
    isActive: true,
  });

  // Parent zones options (filtered by selected college)
  const parentZoneOptions =
    zonesData?.data?.filter((z: Zone) => !isEditMode || z._id !== zone?._id) ||
    [];

  // Schema based on mode
  const schema = isEditMode ? updateZoneSchema : createZoneSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateZoneInput | UpdateZoneInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "other",
      description: "",
      location: {
        coordinates: [85.324, 27.7172],
        address: "",
      },
      building: "",
      floor: undefined,
      roomNumbers: [],
      isIndoor: true,
      tags: [],
      parentZoneId: "",
    },
  });

  const watchLocation = watch("location");
  const watchIsIndoor = watch("isIndoor");

  // Reset form when zone changes (for edit mode)
  useEffect(() => {
    if (open && zone) {
      // Edit mode - populate form with zone data
      reset({
        name: zone.name,
        type: zone.type,
        description: zone.description || "",
        location: {
          coordinates: zone.location?.coordinates || [85.324, 27.7172],
          address: zone.location?.address || "",
        },
        building: zone.building || "",
        floor: zone.floor,
        roomNumbers: zone.roomNumbers || [],
        isIndoor: zone.isIndoor !== undefined ? zone.isIndoor : true,
        tags: zone.tags || [],
        parentZoneId: zone.parentZoneId?._id || "",
      });
      setTags(zone.tags || []);
      setRoomNumbers(zone.roomNumbers || []);
      setMapPosition(
        zone.location?.coordinates
          ? [zone.location.coordinates[1], zone.location.coordinates[0]]
          : null,
      );
    } else if (open && !zone) {
      // Create mode - reset to empty
      reset({
        name: "",
        type: "other",
        description: "",
        location: {
          coordinates: [85.324, 27.7172],
          address: "",
        },
        building: "",
        floor: undefined,
        roomNumbers: [],
        isIndoor: true,
        tags: [],
        parentZoneId: "",
      });
      setTags([]);
      setRoomNumbers([]);
      setMapPosition(null);
    }
  }, [open, zone, reset, preselectedCollegeId]);

  // Sync tags with form
  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  // Sync room numbers with form
  useEffect(() => {
    setValue("roomNumbers", roomNumbers);
  }, [roomNumbers, setValue]);

  // Update map position when coordinates change from form
  useEffect(() => {
    const coords = watchLocation?.coordinates;
    if (coords && coords.length === 2 && !isUserAction.current) {
      setMapPosition([coords[1], coords[0]]);
    }
  }, [watchLocation?.coordinates]);

  // Initialize map
  useEffect(() => {
    if (open) {
      setTimeout(() => setIsMapReady(true), 100);
    }
  }, [open]);

  // Handle map position change
  const handleMapPositionChange = useCallback(
    (newPosition: [number, number]) => {
      isUserAction.current = true;
      setMapPosition(newPosition);
      setValue("location.coordinates", [newPosition[1], newPosition[0]], {
        shouldValidate: true,
      });
      setTimeout(() => {
        isUserAction.current = false;
      }, 100);
    },
    [setValue],
  );

  // Add tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Add room number
  const handleAddRoom = () => {
    const trimmedRoom = roomInput.trim().toUpperCase();
    if (trimmedRoom && !roomNumbers.includes(trimmedRoom)) {
      setRoomNumbers([...roomNumbers, trimmedRoom]);
      setRoomInput("");
    }
  };

  const handleRemoveRoom = (roomToRemove: string) => {
    setRoomNumbers(roomNumbers.filter((room) => room !== roomToRemove));
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleMapPositionChange([latitude, longitude]);
        toast.success("Location detected!");
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  };

  const onSubmit = async (values: CreateZoneInput | UpdateZoneInput) => {
    try {
      if (isEditMode && zone) {
        // Update mode
        const updateData: UpdateZoneInput = {
          name: values.name,
          type: values.type as any,
          description: values.description,
          location: values.location,
          building: values.building,
          floor: values.floor,
          roomNumbers: values.roomNumbers,
          isIndoor: values.isIndoor,
          tags: values.tags,
          parentZoneId: values.parentZoneId || undefined,
        };

        await updateZone.mutateAsync({ id: zone._id, data: updateData as any });
      } else {
        const createData: CreateZoneInput = {
          name: values.name!,
          type: values.type as any,
          description: values.description,
          location: values.location!,
          building: values.building,
          floor: values.floor,
          roomNumbers: values.roomNumbers!,
          isIndoor: values.isIndoor!,
          tags: values.tags!,
          parentZoneId: values.parentZoneId || undefined,
          collegeId: user?.college?.id,
        };

        await createZone.mutateAsync(createData as any);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? "Edit Zone" : "Add New Zone"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update zone details and location"
              : "Create a new zone for lost and found items location"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* College Selection */}
          <div className="space-y-2">
            <Label htmlFor="collegeId" className="text-sm font-medium">
              College <span className="text-red-500">*</span>
            </Label>
            <Input
              value={user?.college?.name}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Zone Name */}
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="name" className="text-sm font-medium">
                  Zone Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Central Library, Main Building"
                  {...register("name")}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Zone Type */}
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="type" className="text-sm font-medium">
                  Zone Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  {...register("type")}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value="">Select zone type</option>
                  {ZONE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the zone (e.g., Main library with study areas, computer lab with 50 PCs)"
                {...register("description")}
                rows={3}
                className="mt-1"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Add tag (e.g., quiet, popular, new)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Location Details
            </h3>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address / Landmark
              </Label>
              <Input
                id="address"
                placeholder="e.g., Near main entrance, 2nd floor"
                {...register("location.address")}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            {/* Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Location on Map</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  disabled={isSubmitting}
                >
                  <MapPin className="mr-1 h-4 w-4" />
                  Use Current Location
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Click on the map or drag the marker to set exact location
              </p>

              {isMapReady &&
                typeof window !== "undefined" &&
                user?.college?.id && (
                  <MapContainer
                    key="zone-map"
                    center={mapPosition || defaultCenter}
                    zoom={15}
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

              {!user?.college?.id && !isEditMode && (
                <p className="text-sm text-yellow-600">
                  Please select a college first to enable map location.
                </p>
              )}

              {/* Coordinates Display */}
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={watchLocation?.coordinates?.[0]?.toFixed(6) || ""}
                    readOnly
                    className="bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={watchLocation?.coordinates?.[1]?.toFixed(6) || ""}
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
                <p className="text-xs text-red-500">
                  {errors.location.coordinates.message}
                </p>
              )}
            </div>
          </div>

          {/* Building Details Section */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Building Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Building Name */}
              <div>
                <Label htmlFor="building" className="text-sm font-medium">
                  Building Name
                </Label>
                <Input
                  id="building"
                  placeholder="e.g., Block A, Main Building"
                  {...register("building")}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Floor Number */}
              <div>
                <Label htmlFor="floor" className="text-sm font-medium">
                  Floor Number
                </Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 1, 2, -1 for basement"
                  {...register("floor", { valueAsNumber: true })}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.floor && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.floor.message}
                  </p>
                )}
              </div>
            </div>

            {/* Room Numbers */}
            <div>
              <Label className="text-sm font-medium">Room Numbers</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {roomNumbers.map((room) => (
                  <Badge key={room} variant="outline" className="gap-1">
                    <Layers className="h-3 w-3" />
                    {room}
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(room)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Add room number (e.g., 101, 202A)"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddRoom())
                  }
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRoom}
                  disabled={!roomInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Parent Zone */}
            {parentZoneOptions.length > 0 && (
              <div>
                <Label htmlFor="parentZoneId" className="text-sm font-medium">
                  Parent Zone
                </Label>
                <select
                  id="parentZoneId"
                  {...register("parentZoneId")}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isSubmitting || !user?.college?.id}
                >
                  <option value="">None (Top-level zone)</option>
                  {parentZoneOptions.map((zone: Zone) => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name} ({zone.type})
                    </option>
                  ))}
                </select>
                {isZonesLoading && (
                  <p className="mt-1 text-xs text-gray-500">
                    Loading parent zones...
                  </p>
                )}
                {!user?.college?.id && !isEditMode && (
                  <p className="mt-1 text-xs text-yellow-600">
                    Select a college first to see parent zones.
                  </p>
                )}
              </div>
            )}

            {/* Indoor/Outdoor Switch */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Indoor Zone</Label>
                <p className="text-xs text-gray-500">
                  Is this zone located indoors (e.g., building, library) or
                  outdoors?
                </p>
              </div>
              <Switch
                checked={watchIsIndoor}
                onCheckedChange={(checked: boolean) =>
                  setValue("isIndoor", checked)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              disabled={isSubmitting || (!isEditMode && !user?.college?.id)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Zone" : "Create Zone"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
