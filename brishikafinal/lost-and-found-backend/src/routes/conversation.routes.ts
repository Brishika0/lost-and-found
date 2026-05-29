// import express from "express";
// import {
//   getMyConversations,
//   createConversation,
//   addParticipant,
//   sendMessage,
// } from "../controller/conversation.controller";
// import { auth } from "../middleware/auth.middleware";

// const router = express.Router();

// router.use(auth);

// router.get("/", getMyConversations);
// router.post("/", createConversation);
// router.post("/send-message", sendMessage);
// router.post("/:conversationId/participants", addParticipant);

// export default router;

import express from "express";
import {
  getMyConversations,
  createConversation,
  addParticipant,
  sendMessage,
} from "../controller/conversation.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.use(auth); // 👈 changed from protect to auth

router.get("/", getMyConversations);
router.post("/", createConversation);
router.post("/send-message", sendMessage);
router.post("/:conversationId/participants", addParticipant);

export default router;
