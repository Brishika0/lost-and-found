import { Chatbox, ConversationList } from "@talkjs/react-components";
import "@talkjs/react-components/default.css";
import { getTalkSession } from "@talkjs/core";
import type { SelectConversationEvent } from "@talkjs/react-components";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ID } from "@/hooks/useStartConversation";
import { API_BASE_URL } from "@/services/authApis";

export default function ChatPage() {
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0084ff] border-t-transparent"></div>
          <span className="text-sm text-[#65676B]">Loading...</span>
        </div>
      </div>
    );
  }

  return <ChatPageInner userId={user.id} user={user} />;
}

function ChatPageInner({ userId, user }: { userId: string; user: any }) {
  const [searchParams] = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

  const session = getTalkSession({ appId: APP_ID, userId });

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(urlConversationId ?? null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<
    { _id: string; name: string; avatar?: string; email?: string }[]
  >([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"chats" | "people">("chats");
  const modalRef = useRef<HTMLDivElement>(null);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const [conversationsData, setConversationsData] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    async function init() {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations`, {
          credentials: "include",
        });
        const { data } = await res.json();
        setConversationsData(data);

        session.currentUser.createIfNotExists({
          name: user?.name ?? "Me",
          photoUrl: user?.avatar,
        });

        for (const conv of data) {
          for (const p of conv.participants) {
            if (p.userId !== userId) {
              session.user(p.userId).createIfNotExists({
                name: p.name,
                photoUrl: p.avatar,
              });
            }
          }

          const talkConv = session.conversation(conv.talkjsConversationId);

          let conversationSubject = conv.subject;
          if (conv.type === "dm") {
            const otherParticipant = conv.participants.find(
              (p: any) => p.userId !== userId,
            );
            conversationSubject = otherParticipant?.name || "Chat";
          }

          talkConv.createIfNotExists({
            subject: conversationSubject ?? undefined,
            photoUrl:
              conv.type === "dm"
                ? conv.participants.find((p: any) => p.userId !== userId)
                    ?.avatar
                : undefined,
          });

          for (const p of conv.participants) {
            talkConv.participant(p.userId).createIfNotExists();
          }
        }

        if (!selectedConversationId && data.length > 0) {
          const firstConv = data[0];
          setSelectedConversationId(firstConv.talkjsConversationId);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }

    init();
  }, [userId]);

  useEffect(() => {
    if (urlConversationId) {
      setSelectedConversationId(urlConversationId);
      if (window.innerWidth < 768) {
        setShowMobileSidebar(false);
      }
    }
  }, [urlConversationId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowNewChat(false);
        setSelectedContacts([]);
        setGroupName("");
      }
    }

    if (showNewChat) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNewChat]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleCreateChat() {
    if (selectedContacts.length === 0) return;
    setLoading(true);

    try {
      const isGroup = selectedContacts.length > 1;

      const res = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({
          type: isGroup ? "group" : "dm",
          participantIds: selectedContacts,
          subject: isGroup ? groupName || "Group Chat" : undefined,
        }),
      });

      const { data } = await res.json();
      setConversationsData((prev) => [...prev, data]);

      for (const p of data.participants) {
        if (p.userId !== userId) {
          session.user(p.userId).createIfNotExists({ name: p.name });
        }
      }

      const talkConv = session.conversation(data.talkjsConversationId);

      let conversationSubject = data.subject;
      if (data.type === "dm") {
        const otherParticipant = data.participants.find(
          (p: any) => p.userId !== userId,
        );
        conversationSubject = otherParticipant?.name || "Chat";
      }

      talkConv.createIfNotExists({
        subject: conversationSubject ?? undefined,
        photoUrl:
          data.type === "dm"
            ? data.participants.find((p: any) => p.userId !== userId)?.avatar
            : undefined,
      });

      for (const p of data.participants) {
        talkConv.participant(p.userId).createIfNotExists();
      }

      setSelectedConversationId(data.talkjsConversationId);
      setShowNewChat(false);
      setSelectedContacts([]);
      setGroupName("");

      if (window.innerWidth < 768) {
        setShowMobileSidebar(false);
      }
    } catch (err) {
      console.error("handleCreateChat error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBackToChats = () => {
    setShowMobileSidebar(true);
    setSelectedConversationId(null);
  };

  return (
    <div className="flex h-svh w-full grid-cols-12 overflow-hidden bg-[#F0F2F5] md:grid">
      {/* Desktop Sidebar */}
      <aside className="hidden md:col-span-3 md:flex md:flex-shrink-0 md:flex-col md:border-r md:border-[#e4e6eb] md:bg-white">
        <div className="flex items-center justify-between border-b border-[#e4e6eb] px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=0084ff&color=fff`
              }
              alt={user?.name}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-xl font-semibold text-[#050505]">Chats</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] transition-colors hover:bg-[#E4E6EB]"
              title="New message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#050505">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#65676B"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="6" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              placeholder="Search Messenger"
              className="flex-1 bg-transparent text-sm text-[#050505] outline-none placeholder:text-[#65676B]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 rounded-full bg-[#F0F2F5] p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#65676B">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                </svg>
              </div>
              <p className="text-sm text-[#65676B]">No conversations yet</p>
              <p className="mt-1 text-xs text-[#65676B]">
                Start a new chat to begin messaging
              </p>
            </div>
          ) : (
            <ConversationList
              appId={APP_ID}
              userId={userId}
              selectedConversationId={selectedConversationId ?? undefined}
              onSelectConversation={(event: SelectConversationEvent) =>
                setSelectedConversationId(event.conversation!.id)
              }
              style={{
                height: "100%",
                width: "100%",
                border: "none",
                borderRadius: 0,
                fontSize: "12px",
              }}
            />
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        ref={mobileSidebarRef}
        className={`absolute inset-0 z-20 bg-white transition-transform duration-300 md:hidden ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e4e6eb] px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=0084ff&color=fff`
              }
              alt={user?.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-2xl font-semibold text-[#050505]">Chats</span>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F2F5] transition-colors hover:bg-[#E4E6EB]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#050505">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#65676B"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="6" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              placeholder="Search Messenger"
              className="flex-1 bg-transparent text-sm text-[#050505] outline-none placeholder:text-[#65676B]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex border-b border-[#e4e6eb]">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "chats"
                ? "border-b-2 border-[#0084ff] text-[#0084ff]"
                : "text-[#65676B]"
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "people"
                ? "border-b-2 border-[#0084ff] text-[#0084ff]"
                : "text-[#65676B]"
            }`}
          >
            People
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" &&
            (conversationsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 rounded-full bg-[#F0F2F5] p-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#65676B"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                  </svg>
                </div>
                <p className="text-sm text-[#65676B]">No conversations yet</p>
                <p className="mt-1 text-xs text-[#65676B]">
                  Start a new chat to begin messaging
                </p>
              </div>
            ) : (
              <ConversationList
                appId={APP_ID}
                userId={userId}
                selectedConversationId={selectedConversationId ?? undefined}
                onSelectConversation={(event: SelectConversationEvent) => {
                  setSelectedConversationId(event.conversation!.id);
                  setShowMobileSidebar(false);
                }}
                style={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                  borderRadius: 0,
                }}
              />
            ))}
          {activeTab === "people" && (
            <div className="p-4">
              <p className="text-center text-sm text-[#65676B]">
                People you may know will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {/* Chat Panel */}
      <main className="col-span-9 flex flex-col bg-white">
        {selectedConversationId ? (
          <Chatbox
            appId={APP_ID}
            userId={userId}
            conversationId={selectedConversationId}
            style={{
              width: "100%",
              height: "100%",
              fontSize: "12px",
              borderRadius: 0,
              border: "none",
            }}
            chatHeaderVisible={true}
            onBackButtonClick={handleBackToChats}
          />
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-4 md:flex">
            <div className="rounded-full bg-[#F0F2F5] p-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#65676B"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#050505]">
                Your messages
              </h3>
              <p className="mt-1 text-sm text-[#65676B]">
                Send private photos and messages to a friend or group
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 rounded-full bg-[#0084ff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0073e0]"
              >
                Send message
              </button>
            </div>
          </div>
        )}
      </main>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 md:items-center">
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-t-2xl bg-white shadow-xl md:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e4e6eb] p-4">
              <h2 className="text-lg font-semibold text-[#050505]">
                New message
              </h2>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedContacts([]);
                  setGroupName("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-xl hover:bg-[#E4E6EB]"
              >
                ×
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {selectedContacts.length > 1 && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Group name (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full rounded-lg border border-[#e4e6eb] px-3 py-2 text-sm focus:border-[#0084ff] focus:outline-none"
                  />
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 rounded-lg bg-[#F0F2F5] px-3 py-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#65676B"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search people"
                    className="flex-1 bg-transparent text-sm outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {filteredContacts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#65676B]">
                      {searchQuery
                        ? "No results found"
                        : "No contacts available"}
                    </p>
                    {!searchQuery && (
                      <p className="mt-1 text-xs text-[#65676B]">
                        Start a conversation from a lost item post
                      </p>
                    )}
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <label
                      key={contact._id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                        selectedContacts.includes(contact._id)
                          ? "bg-[#E7F3FF]"
                          : "hover:bg-[#F0F2F5]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={(e) =>
                          setSelectedContacts((prev) =>
                            e.target.checked
                              ? [...prev, contact._id]
                              : prev.filter((id) => id !== contact._id),
                          )
                        }
                        className="h-5 w-5 rounded border-[#e4e6eb] text-[#0084ff] focus:ring-[#0084ff]"
                      />
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-[#F0F2F5]">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            className="h-full w-full object-cover"
                            alt={contact.name}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#050505]">
                            {contact.name[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-sm text-[#050505]">
                        {contact.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-[#e4e6eb] p-4">
              <button
                onClick={handleCreateChat}
                disabled={selectedContacts.length === 0 || loading}
                className="w-full rounded-full bg-[#0084ff] py-2 text-sm font-medium text-white transition-colors hover:bg-[#0073e0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating..."
                  : selectedContacts.length > 1
                    ? `Create group (${selectedContacts.length})`
                    : "Start conversation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
