// // // components/disputes/AssignAdminDialog.tsx
// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { useAssignAdminToDispute } from "@/hooks/useDisputes";
// import { useGetAdmins } from "@/hooks/useUsers";
// import type { Dispute } from "@/types/dispute";
// import { Loader2, UserCheck } from "lucide-react";

// interface AssignAdminDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   dispute: Dispute | null;
//   onSuccess?: () => void;
// }

// export const AssignAdminDialog = ({
//   open,
//   onOpenChange,
//   dispute,
//   onSuccess,
// }: AssignAdminDialogProps) => {
//   const [selectedAdminId, setSelectedAdminId] = useState<string>("");

//   const { mutate: assignAdmin, isPending, error } = useAssignAdminToDispute();

//   // Get available admins (college admins and super admins)
//   const { data: adminsData, isLoading: isLoadingAdmins } = useGetAdmins({
//     page: 1,
//     limit: 100,
//     collegeId: dispute?.collegeId,
//   });

//   const admins = adminsData?.data ?? [];

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!dispute || !selectedAdminId) return;

//     assignAdmin(
//       {
//         id: dispute._id,
//         data: { adminId: selectedAdminId },
//       },
//       {
//         onSuccess: () => {
//           setSelectedAdminId("");
//           onSuccess?.();
//           onOpenChange(false);
//         },
//       }
//     );
//   };

//   const selectedAdmin = admins.find((admin) => admin._id === selectedAdminId);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <form onSubmit={handleSubmit}>
//           <DialogHeader>
//             <DialogTitle>Assign Admin</DialogTitle>
//             <DialogDescription>
//               Assign an admin to handle this dispute. The admin will be notified and can start reviewing the case.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             {/* Dispute Info */}
//             {dispute && (
//               <div className="rounded-lg bg-muted p-3">
//                 <p className="text-sm font-medium">{dispute.title}</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Priority:{" "}
//                   <Badge
//                     variant="outline"
//                     className={
//                       dispute.priority === "urgent"
//                         ? "border-red-500 text-red-600"
//                         : dispute.priority === "high"
//                         ? "border-orange-500 text-orange-600"
//                         : ""
//                     }
//                   >
//                     {dispute.priority}
//                   </Badge>
//                 </p>
//               </div>
//             )}

//             {/* Admin Selection */}
//             <div className="space-y-2">
//               <Label htmlFor="admin">Select Admin</Label>
//               <Select
//                 value={selectedAdminId}
//                 onValueChange={setSelectedAdminId}
//                 disabled={isPending || isLoadingAdmins}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choose an admin to assign" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {admins.map((admin) => (
//                     <SelectItem key={admin._id} value={admin._id}>
//                       <div className="flex items-center gap-2">
//                         <Avatar className="h-6 w-6">
//                           <AvatarImage src={admin.avatar} />
//                           <AvatarFallback>
//                             {admin.name.charAt(0).toUpperCase()}
//                           </AvatarFallback>
//                         </Avatar>
//                         <span>{admin.name}</span>
//                         <Badge variant="outline" className="ml-2">
//                           {admin.role === "super_admin" ? "Super Admin" : "College Admin"}
//                         </Badge>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               {isLoadingAdmins && (
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Loading admins...
//                 </div>
//               )}

//               {admins.length === 0 && !isLoadingAdmins && (
//                 <Alert>
//                   <AlertDescription>
//                     No admins available to assign. Please contact a super admin.
//                   </AlertDescription>
//                 </Alert>
//               )}
//             </div>

//             {/* Selected Admin Preview */}
//             {selectedAdmin && !isLoadingAdmins && (
//               <div className="rounded-lg border p-3">
//                 <p className="text-sm font-medium mb-2">Selected Admin</p>
//                 <div className="flex items-center gap-3">
//                   <Avatar>
//                     <AvatarImage src={selectedAdmin.avatar} />
//                     <AvatarFallback>
//                       {selectedAdmin.name.charAt(0).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-medium">{selectedAdmin.name}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedAdmin.email}
//                     </p>
//                     <Badge variant="outline" className="mt-1">
//                       {selectedAdmin.role === "super_admin" ? "Super Admin" : "College Admin"}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>
//                   {error.message || "Failed to assign admin"}
//                 </AlertDescription>
//               </Alert>
//             )}
//           </div>

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isPending}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={!selectedAdminId || isPending || admins.length === 0}>
//               {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               <UserCheck className="mr-2 h-4 w-4" />
//               Assign Admin
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };
