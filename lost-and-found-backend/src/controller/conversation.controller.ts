import { Response } from "express";
import Conversation from "../models/conversation.modal";
import User from "../models/user.model";
import { AuthRequest } from "../types/middlewareTypes";

// GET /api/conversations
export const getMyConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id; // ← Use _id, not id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const conversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    }).sort({ "lastMessage.sentAt": -1 });

    res.json({ success: true, data: conversations });
  } catch (err: any) {
    console.error("getMyConversations error:", err?.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/conversations
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { type, participantIds, subject, photoUrl } = req.body;
    const currentUser = req.user;

    if (!currentUser || !currentUser._id) {
      // ← Check _id, not id
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!type || !participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "type and participantIds are required",
      });
    }

    const currentUserId = currentUser._id.toString(); // ← Use _id
    const otherIds: string[] = participantIds.map((id: any) => id.toString());
    const allIds = [...new Set([currentUserId, ...otherIds])];

    // Fetch users from DB
    const users = await User.find({ _id: { $in: allIds } }).select(
      "_id name avatar",
    );

    if (users.length !== allIds.length) {
      return res.status(400).json({
        success: false,
        message: `Expected ${allIds.length} users, found ${users.length}. Check participantIds.`,
      });
    }

    // Build stable TalkJS conversation ID
    const talkjsConversationId =
      type === "dm"
        ? [...allIds].sort().join("_")
        : [...allIds].sort().join("_") + "_group";

    // Return existing conversation if already created
    const existing = await Conversation.findOne({ talkjsConversationId });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    // Sync all users to TalkJS
    for (const u of users) {
      await fetch(
        `https://api.talkjs.com/v1/${process.env.TALKJS_APP_ID}/users/${u._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
          },
          body: JSON.stringify({
            name: u.name,
            photoUrl: u.avatar ?? null,
          }),
        },
      );
    }

    // Create conversation in TalkJS
    const talkjsRes = await fetch(
      `https://api.talkjs.com/v1/${process.env.TALKJS_APP_ID}/conversations/${talkjsConversationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
        },
        body: JSON.stringify({
          participants: allIds,
          subject: subject ?? null,
          photoUrl: photoUrl ?? null,
        }),
      },
    );

    if (!talkjsRes.ok) {
      const talkjsBody = await talkjsRes.text();
      return res.status(500).json({
        success: false,
        message: "TalkJS conversation creation failed",
        error: talkjsBody,
      });
    }

    // Save to MongoDB
    const participants = users.map((u) => ({
      userId: u._id,
      name: u.name,
      avatar: u.avatar ?? undefined,
      joinedAt: new Date(),
    }));

    const conversation = await Conversation.create({
      talkjsConversationId,
      type,
      participants,
      subject: subject ?? null,
      photoUrl: photoUrl ?? null,
      createdBy: currentUser._id, // ← Use _id
      collegeId: currentUser.collegeId,
      isActive: true,
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (err: any) {
    console.error("createConversation error:", err?.message);

    // Race condition — two requests created the same convo simultaneously
    if (err?.code === 11000) {
      const existing = await Conversation.findOne({
        talkjsConversationId: err?.keyValue?.talkjsConversationId,
      });
      return res.status(200).json({ success: true, data: existing });
    }

    res
      .status(500)
      .json({ success: false, message: err?.message ?? "Server error" });
  }
};

// POST /api/conversations/send-message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, text, custom } = req.body;
    const currentUser = req.user;

    if (!currentUser || !currentUser._id) {
      // ← Check _id
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: "conversationId and text are required",
      });
    }

    const senderId = currentUser._id.toString(); // ← Use _id

    const response = await fetch(
      `https://api.talkjs.com/v1/${process.env.TALKJS_APP_ID}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
        },
        body: JSON.stringify([
          {
            text,
            sender: senderId,
            type: "UserMessage",
            custom: custom ?? {},
          },
        ]),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "TalkJS failed to send message",
        error: responseText,
      });
    }

    res.json({ success: true, data: JSON.parse(responseText) });
  } catch (err: any) {
    console.error("sendMessage error:", err?.message);
    res
      .status(500)
      .json({ success: false, message: err?.message ?? "Server error" });
  }
};

// POST /api/conversations/:conversationId/participants
export const addParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const currentUser = req.user;

    if (!currentUser || !currentUser._id) {
      // ← Check _id
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("name avatar _id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Sync user to TalkJS
    await fetch(
      `https://api.talkjs.com/v1/${process.env.TALKJS_APP_ID}/users/${user._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
        },
        body: JSON.stringify({
          name: user.name,
          photoUrl: user.avatar ?? null,
        }),
      },
    );

    // Add to TalkJS conversation
    await fetch(
      `https://api.talkjs.com/v1/${process.env.TALKJS_APP_ID}/conversations/${conversationId}/participants/${user._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TALKJS_SECRET_KEY}`,
        },
        body: JSON.stringify({ notify: true }),
      },
    );

    // Update MongoDB
    const conversation = await Conversation.findOneAndUpdate(
      { talkjsConversationId: conversationId },
      {
        $addToSet: {
          participants: {
            userId: user._id,
            name: user.name,
            avatar: user.avatar ?? undefined,
            joinedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.json({ success: true, data: conversation });
  } catch (err: any) {
    console.error("addParticipant error:", err?.message);
    res
      .status(500)
      .json({ success: false, message: err?.message ?? "Server error" });
  }
};
