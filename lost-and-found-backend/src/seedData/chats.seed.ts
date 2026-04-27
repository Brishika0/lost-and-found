import { Types } from "mongoose";

export const chats = [
  // Active chat about ID card
  {
    _id: new Types.ObjectId("650000000000000000000401"),
    itemId: new Types.ObjectId("650000000000000000000203"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    initiatorId: new Types.ObjectId("650000000000000000000023"), // Aayush (founder)
    participantIds: [
      new Types.ObjectId("650000000000000000000023"),
      new Types.ObjectId("650000000000000000000022"), // Shristi (owner)
    ],
    status: "active",
    requestMessage: "Hi, I found your ID card in the cafeteria!",
    requestedAt: new Date("2024-02-17T09:50:00Z"),
    acceptedAt: new Date("2024-02-17T10:00:00Z"),
    acceptedBy: new Types.ObjectId("650000000000000000000022"),
    messages: [
      {
        senderId: new Types.ObjectId("650000000000000000000023"),
        content: "Hi, I found your ID card in the cafeteria!",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000023")],
        createdAt: new Date("2024-02-17T09:51:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
      {
        senderId: new Types.ObjectId("650000000000000000000022"),
        content: "Oh thank you so much! Where can I pick it up?",
        messageType: "text",
        readBy: [
          new Types.ObjectId("650000000000000000000022"),
          new Types.ObjectId("650000000000000000000023"),
        ],
        readAt: new Date("2024-02-17T10:01:00Z"),
        createdAt: new Date("2024-02-17T10:02:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
      {
        senderId: new Types.ObjectId("650000000000000000000023"),
        content:
          "I'll be in the cafeteria during lunch (12-1pm). Or we can meet at the security desk.",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000023")],
        createdAt: new Date("2024-02-17T10:05:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
      {
        senderId: new Types.ObjectId("650000000000000000000022"),
        content:
          "Perfect! I'll meet you at the cafeteria at 12:30. Thanks again!",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000022")],
        createdAt: new Date("2024-02-17T10:10:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
    ],
    lastMessage: {
      content:
        "Perfect! I'll meet you at the cafeteria at 12:30. Thanks again!",
      senderId: new Types.ObjectId("650000000000000000000022"),
      sentAt: new Date("2024-02-17T10:10:00Z"),
      isRead: false,
    },
    unreadCount: new Map([
      [new Types.ObjectId("650000000000000000000022").toString(), 0],
      [new Types.ObjectId("650000000000000000000023").toString(), 1],
    ]),
    lastActivityAt: new Date("2024-02-17T10:10:00Z"),
  },

  // Pending chat request about MacBook
  {
    _id: new Types.ObjectId("650000000000000000000402"),
    itemId: new Types.ObjectId("650000000000000000000201"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    initiatorId: new Types.ObjectId("650000000000000000000022"), // Shristi
    participantIds: [
      new Types.ObjectId("650000000000000000000022"),
      new Types.ObjectId("650000000000000000000021"), // Bishal (owner)
    ],
    status: "pending",
    requestMessage:
      "Hi Bishal, I think I saw someone with a MacBook in the library yesterday. Want me to help you look?",
    requestedAt: new Date("2024-02-16T11:30:00Z"),
    messages: [
      {
        senderId: new Types.ObjectId("650000000000000000000022"),
        content:
          "Hi Bishal, I think I saw someone with a MacBook in the library yesterday. Want me to help you look?",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000022")],
        createdAt: new Date("2024-02-16T11:31:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
    ],
    lastMessage: {
      content:
        "Hi Bishal, I think I saw someone with a MacBook in the library yesterday. Want me to help you look?",
      senderId: new Types.ObjectId("650000000000000000000022"),
      sentAt: new Date("2024-02-16T11:31:00Z"),
      isRead: false,
    },
    unreadCount: new Map([
      [new Types.ObjectId("650000000000000000000021").toString(), 1],
    ]),
    lastActivityAt: new Date("2024-02-16T11:31:00Z"),
  },

  // Active chat about backpack
  {
    _id: new Types.ObjectId("650000000000000000000403"),
    itemId: new Types.ObjectId("650000000000000000000205"),
    collegeId: new Types.ObjectId("650000000000000000000002"),
    initiatorId: new Types.ObjectId("650000000000000000000025"), // Roshan (founder)
    participantIds: [
      new Types.ObjectId("650000000000000000000025"),
      new Types.ObjectId("650000000000000000000024"), // Pragya (friend of owner)
    ],
    status: "active",
    requestMessage:
      "Hi, I found a black North Face backpack in the computer lab. Your friend might be looking for it?",
    requestedAt: new Date("2024-02-19T15:15:00Z"),
    acceptedAt: new Date("2024-02-19T15:20:00Z"),
    acceptedBy: new Types.ObjectId("650000000000000000000024"),
    messages: [
      {
        senderId: new Types.ObjectId("650000000000000000000025"),
        content:
          "Hi, I found a black North Face backpack in the computer lab. Your friend might be looking for it?",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000025")],
        createdAt: new Date("2024-02-19T15:16:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
      {
        senderId: new Types.ObjectId("650000000000000000000024"),
        content:
          "Yes! That's my friend's backpack. He lost it yesterday. What's inside it?",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000024")],
        createdAt: new Date("2024-02-19T15:21:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
      {
        senderId: new Types.ObjectId("650000000000000000000025"),
        content:
          "It has some notebooks and a pencil case. Tell him to describe it more specifically to claim it.",
        messageType: "text",
        readBy: [new Types.ObjectId("650000000000000000000025")],
        createdAt: new Date("2024-02-19T15:25:00Z"),
        isDeleted: false,
        deletedFor: [],
      },
    ],
    lastMessage: {
      content:
        "It has some notebooks and a pencil case. Tell him to describe it more specifically to claim it.",
      senderId: new Types.ObjectId("650000000000000000000025"),
      sentAt: new Date("2024-02-19T15:25:00Z"),
      isRead: false,
    },
    unreadCount: new Map([
      [new Types.ObjectId("650000000000000000000024").toString(), 1],
      [new Types.ObjectId("650000000000000000000025").toString(), 0],
    ]),
    lastActivityAt: new Date("2024-02-19T15:25:00Z"),
  },
];
