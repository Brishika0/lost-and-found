import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  useLostItem,
  useVerifyItem,
  useDeleteItem,
  usePermanentDeleteItem,
  useResolveFlags,
} from "@/hooks/useLostItems";
import {
  ShieldCheck,
  Flag,
  Trash2,
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  Download,
  MoreHorizontal,
  Archive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PostDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resolveAction, setResolveAction] = useState<"keep" | "remove">("keep");

  const { data, isLoading, refetch } = useLostItem(id!);

  const verifyMutation = useVerifyItem();
  const deleteMutation = useDeleteItem();
  const permanentDeleteMutation = usePermanentDeleteItem();
  const resolveFlagsMutation = useResolveFlags();

  const item = data?.data;

  const handleVerify = async () => {
    await verifyMutation.mutateAsync(id!);
    refetch();
  };

  const handleResolveFlags = async () => {
    await resolveFlagsMutation.mutateAsync({
      id: id!,
      data: { action: resolveAction },
    });
    setShowFlagModal(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-indigo-600/20"></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading item details...
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Item Not Found
          </h2>
          <p className="mb-6 text-slate-500 dark:text-slate-400">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/posts")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const primaryImage =
    item.images?.find((img) => img.isPrimary) || item.images?.[0];
  const StatusIcon =
    item.status === "lost"
      ? AlertCircle
      : item.status === "found"
        ? CheckCircle2
        : Award;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/posts")}
              className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              {!item.isVerified && (
                <button
                  onClick={handleVerify}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Item
                </button>
              )}
              {item.flagCount > 0 && (
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  <Flag className="h-4 w-4" />
                  {item.flagCount} Flag{item.flagCount !== 1 ? "s" : ""}
                </button>
              )}
              <div className="group relative">
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </button>
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                  <div className="rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => deleteMutation.mutate(id!)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-slate-50 dark:text-amber-400 dark:hover:bg-slate-700"
                    >
                      <Archive className="h-4 w-4" />
                      Soft Delete
                    </button>
                    <button
                      onClick={() => permanentDeleteMutation.mutate(id!)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:text-red-400 dark:hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Permanent Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column - Media & Description */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Hero Image */}
            <div className="group relative mb-6 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {primaryImage ? (
                <>
                  <img
                    src={primaryImage.url}
                    alt={item.itemName}
                    className="h-[500px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setSelectedImage(primaryImage.url)}
                    className="absolute right-4 bottom-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex h-[500px] flex-col items-center justify-center">
                  <div className="rounded-full bg-slate-200 p-6 dark:bg-slate-700">
                    <ImageIcon className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="mt-4 text-slate-500">No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {item.images && item.images.length > 1 && (
              <div className="mb-8 grid grid-cols-5 gap-3">
                {item.images.map((img, idx) => (
                  <button
                    key={img.publicId || idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      primaryImage?.url === img.url
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Description
                </h2>
              </div>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
                <div className="mb-0 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-slate-600 dark:text-slate-300">
                    {item.locationDescription}
                  </p>
                </div>
                {item.zoneId && (
                  <div className="mt-0 flex items-center gap-2 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/30">
                    <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-indigo-700 dark:text-indigo-300">
                      Zone: {item.zoneId.name}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Address</Label>
                  <p className="font-medium">
                    {item.zoneId?.location?.address || "No address provided"}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-500">Longitude</Label>
                    <p className="font-mono text-sm">
                      {item.zoneId?.location?.coordinates?.[0]?.toFixed(6) ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Latitude</Label>
                    <p className="font-mono text-sm">
                      {item.zoneId?.location?.coordinates?.[1]?.toFixed(6) ||
                        "—"}
                    </p>
                  </div>
                </div>

                {/* Map Preview */}
                {item.zoneId?.location?.coordinates && (
                  <div className="mt-4 overflow-hidden rounded-lg border">
                    <iframe
                      title="Location Map"
                      width="100%"
                      height="300"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.zoneId.location.coordinates[0] - 0.01},${item.zoneId.location.coordinates[1] - 0.01},${item.zoneId.location.coordinates[0] + 0.01},${item.zoneId.location.coordinates[1] + 0.01}&layer=mapnik&marker=${item.zoneId.location.coordinates[1]},${item.zoneId.location.coordinates[0]}`}
                      allowFullScreen
                    />
                    <div className="bg-gray-50 p-3 text-center text-sm text-gray-500">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${item.zoneId.location.coordinates[1]}&mlon=${item.zoneId.location.coordinates[0]}#map=15/${item.zoneId.location.coordinates[1]}/${item.zoneId.location.coordinates[0]}`}
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
          </div>

          {/* Right Column - Information Cards */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            {/* Item Title & Status */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{item.itemName}</h1>
                  <p className="mt-1 text-indigo-100">
                    ID: {item._id?.slice(0, 8)}...
                  </p>
                </div>
                <Badge className="rounded-full bg-white/40 px-3 py-1 text-sm font-medium">
                  <StatusIcon className="mr-1 inline h-3 w-3" />
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              {item.isVerified && (
                <div className="mt-3 flex items-center gap-2 text-sm text-indigo-100">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Item
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Eye, label: "Views", value: item.views },
                { icon: Heart, label: "Likes", value: item.likesCount },
                { icon: Share2, label: "Shares", value: item.sharesCount },
                {
                  icon: MessageCircle,
                  label: "Comments",
                  value: item.commentsCount,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-slate-900/50"
                >
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-indigo-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-900/50">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-indigo-500" />
                Timeline
              </h3>
              <div className="space-y-3">
                {item.dateLost && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Lost Date
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(item.dateLost), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {item.dateFound && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Found Date
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(item.dateFound), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {item.dateClaimed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Claimed Date
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(item.dateClaimed), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reporter Card */}
            <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-900/50">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Users className="h-4 w-4 text-indigo-500" />
                Reporter
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                  {item.reportedBy?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.reportedBy?.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.reportedBy?.email}
                  </p>
                </div>
              </div>
              {item.contactInfo && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {item.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.contactInfo.phone}
                      </span>
                    </div>
                  )}
                  {item.contactInfo.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.contactInfo.email}
                      </span>
                    </div>
                  )}
                  {item.contactInfo.preferredContact && (
                    <div className="mt-2 rounded-lg bg-indigo-50 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                      Preferred: {item.contactInfo.preferredContact}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-900/50">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Hash className="h-4 w-4 text-indigo-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Flags Section */}
            {item.flags && item.flags.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/20">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                  <Flag className="h-4 w-4" />
                  Reported Issues ({item.flagCount})
                </h3>
                <div className="space-y-3">
                  {item.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-white p-3 dark:bg-slate-900"
                    >
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {flag.reason}
                      </p>
                      {flag.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {flag.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{flag.user}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(flag.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20"
          >
            <XCircle className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => window.open(selectedImage, "_blank")}
            className="absolute right-4 bottom-4 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Resolve Flags Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              Resolve Flags
            </h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              This item has been reported {item.flagCount} time(s). Choose how
              to proceed.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setResolveAction("keep")}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  resolveAction === "keep"
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                    : "border-slate-200 hover:border-emerald-300 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Keep Item
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Remove all flags and keep the item active
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setResolveAction("remove")}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  resolveAction === "remove"
                    ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/30"
                    : "border-slate-200 hover:border-red-300 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Remove Item
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Permanently delete this item from the platform
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFlagModal(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveFlags}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  resolveAction === "remove"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
