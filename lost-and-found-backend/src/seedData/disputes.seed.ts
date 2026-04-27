import { Types } from "mongoose";

export const disputes = [
  // Open dispute about wrongful claim
  {
    _id: new Types.ObjectId("650000000000000000000601"),
    itemId: new Types.ObjectId("650000000000000000000205"),
    collegeId: new Types.ObjectId("650000000000000000000002"),
    reportedBy: new Types.ObjectId("650000000000000000000025"), // Roshan
    reportedAgainst: new Types.ObjectId("650000000000000000000024"), // Pragya
    type: "wrongful_claim",
    status: "open",
    title: "Wrongful claim of found backpack",
    description:
      "Someone is trying to claim the backpack I found, but they can't correctly describe what's inside it. They just say 'notebooks and pencil case' which is too vague.",
    evidence: [
      {
        url: "https://res.cloudinary.com/demo/image/upload/v1/disputes/chat-screenshot-1.jpg",
        type: "screenshot",
        uploadedAt: new Date("2024-02-20T10:00:00Z"),
      },
    ],
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000025"),
        content:
          "I found a black North Face backpack in the computer lab. Now someone is trying to claim it but can't describe the contents properly.",
        isAdmin: false,
        createdAt: new Date("2024-02-20T10:05:00Z"),
      },
    ],
    priority: "high",
    isEscalated: false,
    createdAt: new Date("2024-02-20T10:00:00Z"),
  },

  // Under review dispute
  {
    _id: new Types.ObjectId("650000000000000000000602"),
    itemId: new Types.ObjectId("650000000000000000000201"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    reportedBy: new Types.ObjectId("650000000000000000000021"), // Bishal
    reportedAgainst: new Types.ObjectId("650000000000000000000022"), // Shristi
    type: "communication_issue",
    status: "under_review",
    title: "Harassment in chat",
    description:
      "User keeps sending multiple messages even after I said I'm busy. Feeling uncomfortable.",
    assignedAdmin: new Types.ObjectId("650000000000000000000011"), // Ram Sharma (admin)
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000021"),
        content:
          "User is sending repeated messages asking about my MacBook even though I said I'll check later.",
        isAdmin: false,
        createdAt: new Date("2024-02-18T14:30:00Z"),
      },
      {
        userId: new Types.ObjectId("650000000000000000000011"),
        content:
          "I've reviewed the chat logs and will talk to the user. Please block them for now.",
        isAdmin: true,
        createdAt: new Date("2024-02-18T15:00:00Z"),
      },
    ],
    priority: "medium",
    isEscalated: false,
    createdAt: new Date("2024-02-18T14:30:00Z"),
  },

  // Resolved dispute
  {
    _id: new Types.ObjectId("650000000000000000000603"),
    itemId: new Types.ObjectId("650000000000000000000203"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    reportedBy: new Types.ObjectId("650000000000000000000023"), // Aayush
    reportedAgainst: new Types.ObjectId("650000000000000000000022"), // Shristi
    type: "other",
    status: "resolved",
    title: "Misunderstanding about meeting time",
    description:
      "User didn't show up at agreed time, but it was just a miscommunication.",
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000023"),
        content: "User agreed to meet at 12:30 but didn't show up until 1pm.",
        isAdmin: false,
        createdAt: new Date("2024-02-17T13:15:00Z"),
      },
      {
        userId: new Types.ObjectId("650000000000000000000011"),
        content:
          "I've talked to both parties. It was a misunderstanding about the meeting spot, not the time.",
        isAdmin: true,
        createdAt: new Date("2024-02-17T14:00:00Z"),
      },
    ],
    resolution: {
      type: "mutual_agreement",
      description:
        "Both users clarified it was a misunderstanding about the meeting location. ID card was successfully returned.",
      resolvedBy: new Types.ObjectId("650000000000000000000011"),
      resolvedAt: new Date("2024-02-17T15:00:00Z"),
      actionTaken: "No action needed, issue resolved amicably.",
    },
    priority: "low",
    isEscalated: false,
    createdAt: new Date("2024-02-17T13:15:00Z"),
  },
];
