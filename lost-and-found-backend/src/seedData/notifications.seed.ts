import { Types } from "mongoose";

export const notifications = [
  // Match notification
  {
    _id: new Types.ObjectId("650000000000000000000501"),
    userId: new Types.ObjectId("650000000000000000000021"),
    type: "item_match",
    title: "Potential Match Found!",
    message: "Your lost MacBook Pro matches with a found laptop (85% match)",
    data: {
      lostItemId: new Types.ObjectId("650000000000000000000201"),
      foundItemId: new Types.ObjectId("650000000000000000000205"), // Example found item
      matchScore: 0.85,
    },
    priority: "high",
    isRead: false,
    isDelivered: true,
    isClicked: false,
    deliveredAt: new Date("2024-02-18T09:00:00Z"),
    expiresAt: new Date("2024-03-18T09:00:00Z"),
  },

  // Chat request notification
  {
    _id: new Types.ObjectId("650000000000000000000502"),
    userId: new Types.ObjectId("650000000000000000000021"),
    type: "chat_request",
    title: "New Chat Request",
    message: "Shristi Karki wants to chat about your MacBook Pro",
    data: {
      chatId: new Types.ObjectId("650000000000000000000402"),
      fromUserName: "Shristi Karki",
      itemName: "MacBook Pro 14",
    },
    priority: "medium",
    isRead: false,
    isDelivered: true,
    isClicked: false,
    deliveredAt: new Date("2024-02-16T11:32:00Z"),
    expiresAt: new Date("2024-03-16T11:32:00Z"),
  },

  // Chat accepted notification
  {
    _id: new Types.ObjectId("650000000000000000000503"),
    userId: new Types.ObjectId("650000000000000000000023"),
    type: "chat_accepted",
    title: "Chat Request Accepted",
    message: "Shristi Karki accepted your chat request",
    data: {
      chatId: new Types.ObjectId("650000000000000000000401"),
      fromUserName: "Shristi Karki",
    },
    priority: "low",
    isRead: true,
    isDelivered: true,
    isClicked: true,
    readAt: new Date("2024-02-17T10:05:00Z"),
    deliveredAt: new Date("2024-02-17T10:00:01Z"),
    clickedAt: new Date("2024-02-17T10:01:00Z"),
    expiresAt: new Date("2024-03-17T10:00:00Z"),
  },

  // Chat message notification
  {
    _id: new Types.ObjectId("650000000000000000000504"),
    userId: new Types.ObjectId("650000000000000000000023"),
    type: "chat_message",
    title: "New Message",
    message:
      "Shristi: Perfect! I'll meet you at the cafeteria at 12:30. Thanks again!",
    data: {
      chatId: new Types.ObjectId("650000000000000000000401"),
      message:
        "Perfect! I'll meet you at the cafeteria at 12:30. Thanks again!",
      senderName: "Shristi Karki",
    },
    priority: "low",
    isRead: false,
    isDelivered: true,
    isClicked: false,
    deliveredAt: new Date("2024-02-17T10:11:00Z"),
    expiresAt: new Date("2024-03-17T10:11:00Z"),
  },

  // Comment notification
  {
    _id: new Types.ObjectId("650000000000000000000505"),
    userId: new Types.ObjectId("650000000000000000000022"),
    type: "comment",
    title: "New Comment on Your Post",
    message: "Aayush Gurung commented on your found ID card post",
    data: {
      itemId: new Types.ObjectId("650000000000000000000203"),
      commentId: new Types.ObjectId("650000000000000000000304"),
      commenterName: "Aayush Gurung",
    },
    priority: "low",
    isRead: true,
    isDelivered: true,
    isClicked: false,
    readAt: new Date("2024-02-17T10:00:00Z"),
    deliveredAt: new Date("2024-02-17T09:46:00Z"),
    expiresAt: new Date("2024-03-17T09:46:00Z"),
  },

  // Like notification
  {
    _id: new Types.ObjectId("650000000000000000000506"),
    userId: new Types.ObjectId("650000000000000000000022"),
    type: "like",
    title: "Someone Liked Your Comment",
    message: "Aayush Gurung liked your comment",
    data: {
      itemId: new Types.ObjectId("650000000000000000000203"),
      commentId: new Types.ObjectId("650000000000000000000305"),
      likerName: "Aayush Gurung",
    },
    priority: "low",
    isRead: false,
    isDelivered: true,
    isClicked: false,
    deliveredAt: new Date("2024-02-17T10:35:00Z"),
    expiresAt: new Date("2024-03-17T10:35:00Z"),
  },
];
