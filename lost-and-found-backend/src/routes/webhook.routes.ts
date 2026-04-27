import express, { Request, Response } from "express";
import Conversation from "../models/conversation.modal";

const router = express.Router();

// TalkJS calls this URL on every new message
// Set it in TalkJS dashboard → Webhooks → message.sent
router.post("/talkjs", async (req: Request, res: Response) => {
  try {
    if (req.body.type === "message.sent") {
      const { data } = req.body;
      await Conversation.findOneAndUpdate(
        { talkjsConversationId: data.conversation.id },
        {
          lastMessage: {
            text: data.message.text ?? "[attachment]",
            sentBy: data.message.sender?.id ?? null,
            sentAt: new Date(data.message.createdAt),
          },
        },
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

export default router;
