// import React, { useState } from "react";
// import { Activity, Loader2 } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";

// // Import your activity hooks
// import { useGetRecentItems } from "@/hooks/useItems";
// import { useGetRecentComments } from "@/hooks/useComments";
// import { useGetRecentChats } from "@/hooks/useChats";

// interface ActivityTabProps {
//   collegeId: string;
// }

// export const ActivityTab: React.FC<ActivityTabProps> = ({ collegeId }) => {
//   const [activityType, setActivityType] = useState("all");

//   const { data: itemsData, isLoading: itemsLoading } =
//     useGetRecentItems(collegeId);
//   const { data: commentsData, isLoading: commentsLoading } =
//     useGetRecentComments(collegeId);
//   const { data: chatsData, isLoading: chatsLoading } =
//     useGetRecentChats(collegeId);

//   const isLoading = itemsLoading || commentsLoading || chatsLoading;

//   const activities = [
//     ...(itemsData?.data || []).map((item) => ({
//       id: item._id,
//       type: "item",
//       title: item.itemName,
//       description: `Item ${item.status}`,
//       user: item.reportedBy,
//       timestamp: item.createdAt,
//       status: item.status,
//     })),
//     ...(commentsData?.data || []).map((comment) => ({
//       id: comment._id,
//       type: "comment",
//       title: "New Comment",
//       description: comment.content.substring(0, 50) + "...",
//       user: comment.userId,
//       timestamp: comment.createdAt,
//     })),
//     ...(chatsData?.data || []).map((chat) => ({
//       id: chat._id,
//       type: "chat",
//       title: "Chat Started",
//       description: `Chat about item`,
//       user: chat.participants[0],
//       timestamp: chat.createdAt,
//     })),
//   ].sort(
//     (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
//   );

//   const filteredActivities =
//     activityType === "all"
//       ? activities
//       : activities.filter((a) => a.type === activityType);

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
//       <CardHeader>
//         <CardTitle>Recent Activity</CardTitle>
//         <CardDescription>Latest actions and updates</CardDescription>
//         <Tabs
//           defaultValue="all"
//           className="mt-2"
//           onValueChange={setActivityType}
//         >
//           <TabsList>
//             <TabsTrigger value="all">All</TabsTrigger>
//             <TabsTrigger value="item">Items</TabsTrigger>
//             <TabsTrigger value="comment">Comments</TabsTrigger>
//             <TabsTrigger value="chat">Chats</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </CardHeader>
//       <CardContent>
//         {filteredActivities.length > 0 ? (
//           <div className="space-y-4">
//             {filteredActivities.map((activity) => (
//               <div
//                 key={activity.id}
//                 className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50"
//               >
//                 <div className="rounded-full bg-gray-100 p-2">
//                   {activity.type === "item" && (
//                     <Activity className="h-4 w-4 text-blue-500" />
//                   )}
//                   {activity.type === "comment" && (
//                     <Activity className="h-4 w-4 text-green-500" />
//                   )}
//                   {activity.type === "chat" && (
//                     <Activity className="h-4 w-4 text-purple-500" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <p className="text-sm font-medium">{activity.title}</p>
//                       {activity.status && (
//                         <Badge variant="outline" className="text-xs">
//                           {activity.status}
//                         </Badge>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       {new Date(activity.timestamp).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <p className="mt-1 text-sm text-gray-600">
//                     {activity.description}
//                   </p>
//                   <div className="mt-2 flex items-center">
//                     <Avatar className="mr-1 h-5 w-5">
//                       <AvatarFallback className="text-xs">
//                         {activity.user?.name?.substring(0, 2).toUpperCase() ||
//                           "U"}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-xs text-gray-500">
//                       {activity.user?.name || "Unknown User"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="py-12 text-center">
//             <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
//             <p className="text-gray-500">No recent activity</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export const ActivityTab = () => {
  return (
    <TabsContent value="activity">
      <Card>
        <CardHeader>
          <CardTitle>College Activities</CardTitle>
          <CardDescription>Detailed College Activities</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add more detailed user stats here */}
          <p className="text-gray-500">
            Detailed College cativities coming soon...
          </p>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
