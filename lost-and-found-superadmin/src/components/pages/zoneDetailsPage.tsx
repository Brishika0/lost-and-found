import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetZoneById,
  useDeleteZone,
  useAddRoom,
  useRemoveRoom,
} from "@/hooks/useZones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Building,
  Layers,
  Tag,
  Edit,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ZONE_TYPE_OPTIONS } from "@/types/zone.types";
import { ZoneFormDialog } from "../dialogs/zoneFormDialog";

export default function ZoneDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetZoneById(id || "");

  console.log(data);
  const deleteZone = useDeleteZone();
  const addRoom = useAddRoom();
  const removeRoom = useRemoveRoom();

  const zone = data?.data;

  // Get zone type label and icon
  const zoneTypeInfo = ZONE_TYPE_OPTIONS.find(
    (opt) => opt.value === zone?.type,
  );

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteZone.mutateAsync({ id: id || "" });
      navigate("/zones");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomNumber.trim()) {
      return;
    }

    try {
      await addRoom.mutateAsync({
        id: id || "",
        data: {
          roomNumber: newRoomNumber.trim().toUpperCase(),
          collegeId: zone?.collegeId?._id || "",
        },
      });
      setNewRoomNumber("");
      setIsAddRoomDialogOpen(false);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveRoom = async (roomNumber: string) => {
    try {
      await removeRoom.mutateAsync({
        id: id || "",
        roomNumber,
        data: { collegeId: zone?.collegeId?._id || "" },
      });
      setRoomToDelete(null);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <div className="rounded-xl bg-red-50 p-8">
          <h2 className="text-2xl font-bold text-red-600">Zone Not Found</h2>
          <p className="mt-2 text-gray-600">
            The zone you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={() => navigate("/zones")}>
            Back to Zones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{zone.name}</h1>
            <Badge
              className={
                zone.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {zone.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="text-lg">{zoneTypeInfo?.icon || "📍"}</span>
              {zoneTypeInfo?.label || zone.type}
            </Badge>
          </div>
          <p className="mt-2 text-gray-500">
            {zone.description || "No description provided"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* College Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-gray-500">College Name</Label>
                  <p className="font-medium">{zone.collegeId?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Short Name</Label>
                  <p className="font-medium">{zone.collegeId?.shortName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Domain</Label>
                  <p className="font-mono text-sm font-medium">
                    @{zone.collegeId?.domain}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Building Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Building Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-gray-500">Building</Label>
                  <p className="font-medium">{zone.building || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Floor</Label>
                  <p className="font-medium">
                    {zone.floor !== undefined ? zone.floor : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">
                    Indoor/Outdoor
                  </Label>
                  <p className="font-medium">
                    {zone.isIndoor ? "Indoor" : "Outdoor"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Parent Zone</Label>
                  <p className="font-medium">
                    {zone.parentZoneId?.name || "Top-level zone"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {zone.tags && zone.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {zone.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-gray-500">Created By</Label>
                  <p className="font-medium">
                    {zone.createdBy?.name || "System"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {zone.createdAt && format(new Date(zone.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Last Updated</Label>
                  <p className="font-medium">
                    {zone.updatedBy?.name || "System"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {zone.updatedAt && format(new Date(zone.updatedAt), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Rooms
                </CardTitle>
                <CardDescription>Manage rooms within this zone</CardDescription>
              </div>
              <Button onClick={() => setIsAddRoomDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </CardHeader>
            <CardContent>
              {zone.roomNumbers && zone.roomNumbers.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {zone.roomNumbers.map((room) => (
                    <div
                      key={room}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Layers className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{room}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setRoomToDelete(room)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Layers className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No rooms
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add rooms to this zone to help users find specific
                    locations.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddRoomDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Room
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Address</Label>
                <p className="font-medium">
                  {zone.location?.address || "No address provided"}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-gray-500">Longitude</Label>
                  <p className="font-mono text-sm">
                    {zone.location?.coordinates?.[0]?.toFixed(6) || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Latitude</Label>
                  <p className="font-mono text-sm">
                    {zone.location?.coordinates?.[1]?.toFixed(6) || "—"}
                  </p>
                </div>
              </div>

              {/* Map Preview */}
              {zone.location?.coordinates && (
                <div className="mt-4 overflow-hidden rounded-lg border">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${zone.location.coordinates[0] - 0.01},${zone.location.coordinates[1] - 0.01},${zone.location.coordinates[0] + 0.01},${zone.location.coordinates[1] + 0.01}&layer=mapnik&marker=${zone.location.coordinates[1]},${zone.location.coordinates[0]}`}
                    allowFullScreen
                  />
                  <div className="bg-gray-50 p-3 text-center text-sm text-gray-500">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${zone.location.coordinates[1]}&mlon=${zone.location.coordinates[0]}#map=15/${zone.location.coordinates[1]}/${zone.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View larger map
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Zone Dialog */}
      <ZoneFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        zone={zone}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              zone "{zone.name}" and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
            <DialogDescription>
              Add a new room to "{zone.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                placeholder="e.g., L401, 202A"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
              />
              <p className="text-xs text-gray-500">
                Room numbers will be displayed in uppercase
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddRoomDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRoom} disabled={!newRoomNumber.trim()}>
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Room Confirmation Dialog */}
      <AlertDialog
        open={!!roomToDelete}
        onOpenChange={() => setRoomToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove room "{roomToDelete}" from "
              {zone.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roomToDelete && handleRemoveRoom(roomToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
