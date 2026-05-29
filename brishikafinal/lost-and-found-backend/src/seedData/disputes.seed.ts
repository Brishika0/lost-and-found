import { Types } from "mongoose";

export const disputes = [
  {
    _id: new Types.ObjectId("650000000000000000000501"),
    itemId: new Types.ObjectId("650000000000000000000206"),
    collegeId: new Types.ObjectId("650000000000000000000002"),
    reportedBy: new Types.ObjectId("650000000000000000000025"),
    reportedAgainst: new Types.ObjectId("650000000000000000000024"),
    type: "wrongful_claim",
    status: "open",
    title: "Wrongful claim of found backpack",
    description:
      "Someone is trying to claim the backpack I found, but they can't correctly describe what's inside it.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop",
        type: "screenshot",
        uploadedAt: new Date("2024-03-06T10:00:00Z"),
      },
    ],
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000025"),
        content:
          "I found a black North Face backpack in the sports complex. Now someone is trying to claim it but can't describe the contents properly.",
        isAdmin: false,
        createdAt: new Date("2024-03-06T10:05:00Z"),
      },
    ],
    priority: "high",
    isEscalated: false,
    createdAt: new Date("2024-03-06T10:00:00Z"),
    updatedAt: new Date("2024-03-06T10:00:00Z"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000502"),
    itemId: new Types.ObjectId("650000000000000000000201"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    reportedBy: new Types.ObjectId("650000000000000000000021"),
    reportedAgainst: new Types.ObjectId("650000000000000000000022"),
    type: "communication_issue",
    status: "under_review",
    title: "Miscommunication about meeting time",
    description:
      "User didn't show up at agreed time, causing confusion about item return.",
    assignedAdmin: new Types.ObjectId("650000000000000000000011"),
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000021"),
        content:
          "We agreed to meet at 12:30 but the other person didn't show up until 1pm.",
        isAdmin: false,
        createdAt: new Date("2024-02-17T13:15:00Z"),
      },
      {
        userId: new Types.ObjectId("650000000000000000000011"),
        content:
          "I've reviewed the situation. Both parties agreed to reschedule for tomorrow.",
        isAdmin: true,
        createdAt: new Date("2024-02-17T14:00:00Z"),
      },
    ],
    priority: "medium",
    isEscalated: false,
    createdAt: new Date("2024-02-17T13:15:00Z"),
    updatedAt: new Date("2024-02-17T14:00:00Z"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000503"),
    itemId: new Types.ObjectId("650000000000000000000203"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    reportedBy: new Types.ObjectId("650000000000000000000023"),
    reportedAgainst: new Types.ObjectId("650000000000000000000021"),
    type: "other",
    status: "resolved",
    title: "Misunderstanding about ID card return",
    description:
      "Both parties had a misunderstanding about the meeting location, but it was resolved.",
    messages: [
      {
        userId: new Types.ObjectId("650000000000000000000023"),
        content:
          "We agreed to meet at the cafeteria but the person went to the library instead.",
        isAdmin: false,
        createdAt: new Date("2024-02-27T13:15:00Z"),
      },
      {
        userId: new Types.ObjectId("650000000000000000000011"),
        content:
          "I've talked to both parties. It was a simple miscommunication about the meeting spot.",
        isAdmin: true,
        createdAt: new Date("2024-02-27T14:00:00Z"),
      },
    ],
    resolution: {
      type: "mutual_agreement",
      description:
        "Both users agreed it was a misunderstanding about the meeting location. ID card was successfully returned.",
      resolvedBy: new Types.ObjectId("650000000000000000000011"),
      resolvedAt: new Date("2024-02-27T15:00:00Z"),
      actionTaken: "No action needed, issue resolved amicably.",
    },
    priority: "low",
    isEscalated: false,
    createdAt: new Date("2024-02-27T13:15:00Z"),
    updatedAt: new Date("2024-02-27T15:00:00Z"),
  },
];
