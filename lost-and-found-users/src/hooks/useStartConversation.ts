import { useState } from "react";
import { getTalkSession } from "@talkjs/core";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/services/authApis";

export const APP_ID = import.meta.env.TALKJS_APP_ID ?? "t0i4rE61";

type PostPreview = {
  postId: string;
  postUrl: string;
  postTitle: string;
  postImage: string | null;
  postLocation: string;
  postStatus: string;
};

export function useStartConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function startConversation(
    otherUser: { _id: string; name: string; avatar?: string },
    prefilledMessage?: string,
    postPreview?: PostPreview,
  ) {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Step 1 — create conversation in your DB + TalkJS
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "dm",
          participantIds: [otherUser._id],
          subject: otherUser.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Failed to create conversation:", res.status, errorData);
        return;
      }

      const { data } = await res.json();
      const conversationId: string = data.talkjsConversationId;

      // Step 2 — register in TalkJS client-side session
      const session = getTalkSession({ appId: APP_ID, userId: user.id });

      session.currentUser.createIfNotExists({
        name: user.name ?? "Me",
        photoUrl: user.avatar,
      });

      session.user(otherUser._id).createIfNotExists({
        name: otherUser.name,
        photoUrl: otherUser.avatar,
      });

      const talkConv = session.conversation(conversationId);
      talkConv.createIfNotExists({ subject: otherUser.name });
      talkConv.participant(otherUser._id).createIfNotExists();

      // Step 3 — send the claim message via backend
      if (prefilledMessage) {
        const msgRes = await fetch(
          `${API_BASE_URL}/conversations/send-message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              conversationId,
              text: prefilledMessage,
              custom: postPreview
                ? {
                    type: "post_share",
                    postId: postPreview.postId,
                    postUrl: postPreview.postUrl,
                    postTitle: postPreview.postTitle,
                    postImage: postPreview.postImage ?? "",
                    postLocation: postPreview.postLocation,
                    postStatus: postPreview.postStatus,
                  }
                : {},
            }),
          },
        );

        if (!msgRes.ok) {
          console.error("Failed to send claim message");
        }
      }

      // Step 4 — navigate to chat
      navigate(`/messages?conversationId=${conversationId}`);
    } catch (err) {
      console.error("startConversation error:", err);
    } finally {
      setLoading(false);
    }
  }

  return { startConversation, loading };
}
