// import React, { useState } from "react";
// import { Map, Plus, ChevronRight, Loader2 } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// // Import your zone hook (you'll need to create this)
// import { useGetZones } from "@/hooks/useZones";
// import type { Zone } from "@/types/zone";

// interface ZonesTabProps {
//   collegeId: string;
// }

// export const ZonesTab: React.FC<ZonesTabProps> = ({ collegeId }) => {
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState<string>("all");

//   const { data: zonesData, isLoading } = useGetZones({
//     collegeId,
//     search,
//     type: typeFilter !== "all" ? typeFilter : undefined,
//     page: 1,
//     limit: 50,
//   });

//   const zones = zonesData?.data || [];

//   const zoneTypes = [
//     "library",
//     "cafeteria",
//     "lab",
//     "classroom",
//     "hostel",
//     "sports",
//     "parking",
//     "walkway",
//     "entrance",
//     "other",
//   ];

//   if (isLoading) {
//     return (
//       <Card>
//         <CardContent className="flex justify-center py-12">
//           <Loader2 className="text-primary h-8 w-8 animate-spin" />
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <div>
//           <CardTitle>Campus Zones</CardTitle>
//           <CardDescription>
//             Locations and zones within the campus
//           </CardDescription>
//         </div>
//         <Button size="sm">
//           <Plus className="mr-2 h-4 w-4" />
//           Add Zone
//         </Button>
//       </CardHeader>
//       <CardContent>
//         {/* Filters */}
//         <div className="mb-6 flex gap-4">
//           <Input
//             placeholder="Search zones..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-sm"
//           />
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               {zoneTypes.map((type) => (
//                 <SelectItem key={type} value={type}>
//                   {type.charAt(0).toUpperCase() + type.slice(1)}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {zones.length > 0 ? (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             {zones.map((zone) => (
//               <ZoneCard key={zone._id} zone={zone} />
//             ))}
//           </div>
//         ) : (
//           <div className="py-12 text-center">
//             <Map className="mx-auto mb-3 h-12 w-12 text-gray-300" />
//             <p className="text-gray-500">No zones defined for this college</p>
//             <Button variant="link" className="mt-2">
//               Create your first zone
//             </Button>
//           </div>
//         )}

//         {/* Pagination */}
//         {zonesData?.pagination && zonesData.pagination.pages > 1 && (
//           <div className="mt-6 flex justify-center">
//             {/* Add pagination controls here */}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// // Zone Card Component
// const ZoneCard: React.FC<{ zone: Zone }> = ({ zone }) => (
//   <Card className="cursor-pointer border transition-shadow hover:shadow-md">
//     <CardContent className="p-4">
//       <div className="flex items-start justify-between">
//         <div className="flex items-start space-x-3">
//           <div className="bg-primary/10 rounded-lg p-2">
//             <Map className="text-primary h-5 w-5" />
//           </div>
//           <div>
//             <div className="flex items-center space-x-2">
//               <h3 className="font-semibold">{zone.name}</h3>
//               <Badge variant="outline" className="text-xs">
//                 {zone.type}
//               </Badge>
//             </div>
//             {zone.description && (
//               <p className="mt-1 text-sm text-gray-600">{zone.description}</p>
//             )}
//             <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
//               {zone.isIndoor ? <span>🏠 Indoor</span> : <span>🌳 Outdoor</span>}
//               {zone.floor !== undefined && <span>📍 Floor {zone.floor}</span>}
//               {zone.roomNumbers && zone.roomNumbers.length > 0 && (
//                 <span>🛏️ {zone.roomNumbers.length} rooms</span>
//               )}
//             </div>
//           </div>
//         </div>
//         <ChevronRight className="h-5 w-5 text-gray-400" />
//       </div>
//     </CardContent>
//   </Card>
// );

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export const ZonesTab = () => {
  return (
    <TabsContent value="zones">
      <Card>
        <CardHeader>
          <CardTitle>College Zones</CardTitle>
          <CardDescription>Lists of the collge zones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">College Zone lists coming soon...</p>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
