import { Chatbox, ConversationList } from "@talkjs/react-components";
import "@talkjs/react-components/default.css";
import { getTalkSession } from "@talkjs/core";
import type { SelectConversationEvent } from "@talkjs/react-components";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ID, useStartConversation } from "@/hooks/useStartConversation";
import { API_BASE_URL } from "@/services/authApis";
import { useGetCollegeAdmins, useGetStudents } from "@/hooks/useUsers";
import type { User } from "@/types/user.types";

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
  const [selectedContacts, setSelectedContacts] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"chats" | "people">("chats");
  const [modalRoleTab, setModalRoleTab] = useState<"student" | "admin">(
    "student",
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const [conversationsData, setConversationsData] = useState<any[]>([]);

  const { startConversation, loading: isStartingConversation } =
    useStartConversation();

  // Fetch students only
  const { data: studentsData, isLoading: isStudentsLoading } = useGetStudents({
    limit: 1000,
    collegeId: user?.collegeId?._id || user?.collegeId,
  });

  const { data: adminsData } = useGetCollegeAdmins({
    limit: 1000,
    collegeId: user?.collegeId?._id || user?.collegeId,
  });

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentsData?.data || studentsData.data.length === 0) return [];

    let users = [...studentsData.data];

    // Filter by search
    if (modalSearchQuery) {
      users = users.filter(
        (u: User) =>
          u.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(modalSearchQuery.toLowerCase()),
      );
    }

    // Exclude current user from contacts list
    users = users.filter((u: User) => u._id !== userId);

    return users;
  }, [studentsData, modalSearchQuery, userId]);

  // Filter admins based on search (placeholder until admin API is ready)
  const filteredAdmins = useMemo(() => {
    if (!adminsData || adminsData.data.length === 0) return [];

    let users = [...adminsData.data];

    if (modalSearchQuery) {
      users = users.filter(
        (u: User) =>
          u.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(modalSearchQuery.toLowerCase()),
      );
    }

    users = users.filter((u: User) => u._id !== userId);

    return users;
  }, [adminsData, modalSearchQuery, userId]);

  // Get users based on selected tab
  const getUsersForCurrentTab = () => {
    if (modalRoleTab === "student") {
      return filteredStudents;
    } else {
      return filteredAdmins;
    }
  };

  // Handle starting a conversation with selected user(s)
  const handleStartConversation = async () => {
    if (selectedContacts.length === 0) return;

    setLoading(true);

    try {
      if (selectedContacts.length === 1) {
        // DM - single user
        const otherUser = selectedContacts[0];
        await startConversation(
          {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar,
          },
          undefined, // No prefilled message for new chat
          undefined, // No post preview
        );
        // startConversation already handles navigation
        setShowNewChat(false);
      } else {
        // Group chat - create group via API
        const res = await fetch(`${API_BASE_URL}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: "group",
            participantIds: selectedContacts.map((c) => c._id),
            subject: groupName || "Group Chat",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create group chat");
        }

        const { data } = await res.json();

        // Register participants in TalkJS
        const talkSession = getTalkSession({ appId: APP_ID, userId });

        talkSession.currentUser.createIfNotExists({
          name: user?.name ?? "Me",
          photoUrl: user?.avatar,
        });

        for (const participant of selectedContacts) {
          talkSession.user(participant._id).createIfNotExists({
            name: participant.name,
            photoUrl: participant.avatar,
          });
        }

        const talkConv = talkSession.conversation(data.talkjsConversationId);
        talkConv.createIfNotExists({
          subject: groupName || "Group Chat",
          photoUrl: undefined,
        });

        for (const participant of selectedContacts) {
          talkConv.participant(participant._id).createIfNotExists();
        }

        // Add to conversations list and select it
        setConversationsData((prev) => [...prev, data]);
        setSelectedConversationId(data.talkjsConversationId);
        setShowNewChat(false);
        setSelectedContacts([]);
        setGroupName("");
        setModalRoleTab("student");
        setModalSearchQuery("");

        if (window.innerWidth < 768) {
          setShowMobileSidebar(false);
        }
      }
    } catch (err) {
      console.error("handleStartConversation error:", err);
    } finally {
      setLoading(false);
    }
  };

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
        setModalRoleTab("student");
        setModalSearchQuery("");
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

  const handleBackToChats = () => {
    setShowMobileSidebar(true);
    setSelectedConversationId(null);
  };

  // Get user role badge color and text
  const getUserRoleInfo = (role: string) => {
    if (role === "college_admin") {
      return { bg: "bg-purple-100", text: "text-purple-700", label: "Admin" };
    }
    return { bg: "bg-blue-100", text: "text-blue-700", label: "Student" };
  };

  const usersToShow = getUsersForCurrentTab();
  const isLoading = modalRoleTab === "student" ? isStudentsLoading : false;
  const isCreating = loading || isStartingConversation;

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

      {/* New Chat Modal - Messenger Style */}
      {showNewChat && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 md:items-center">
          <div
            ref={modalRef}
            className="flex max-h-[90%] w-full max-w-md flex-col overflow-scroll rounded-t-2xl bg-white shadow-xl md:rounded-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e4e6eb] px-4 py-2">
              <h2 className="text-xl font-semibold text-[#050505]">
                New message
              </h2>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedContacts([]);
                  setGroupName("");
                  setModalRoleTab("student");
                  setModalSearchQuery("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-xl transition-colors hover:bg-[#E4E6EB]"
              >
                ×
              </button>
            </div>

            {/* Group Name Input (only for groups) */}
            {selectedContacts.length > 1 && (
              <div className="border-b border-[#e4e6eb] px-4 py-2">
                <input
                  type="text"
                  placeholder="Group name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-lg border border-[#e4e6eb] px-3 py-2 text-sm focus:border-[#0084ff] focus:outline-none"
                />
              </div>
            )}

            {/* Search Input */}
            <div className="border-b border-[#e4e6eb] px-4 py-2">
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
                  placeholder="Search people"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#65676B]"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Role Tabs - Only Student and Admin */}
            <div className="flex border-b border-[#e4e6eb] px-4">
              <button
                onClick={() => setModalRoleTab("student")}
                className={`py-2 text-sm font-medium transition-colors ${
                  modalRoleTab === "student"
                    ? "border-b-2 border-[#0084ff] text-[#0084ff]"
                    : "text-[#65676B]"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setModalRoleTab("admin")}
                className={`ml-4 py-2 text-sm font-medium transition-colors ${
                  modalRoleTab === "admin"
                    ? "border-b-2 border-[#0084ff] text-[#0084ff]"
                    : "text-[#65676B]"
                }`}
              >
                Admins
              </button>
            </div>

            {/* Selected Contacts Display */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-[#e4e6eb] p-4">
                <span className="text-xs text-[#65676B]">To:</span>
                {selectedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center gap-1 rounded-full bg-[#E7F3FF] px-2 py-1"
                  >
                    <span className="text-xs text-[#050505]">
                      {contact.name}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedContacts((prev) =>
                          prev.filter((c) => c._id !== contact._id),
                        )
                      }
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[#65676B] hover:text-[#050505]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* User List */}
            <div className="max-h-[400px] overflow-y-scroll">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0084ff] border-t-transparent"></div>
                </div>
              ) : usersToShow.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#65676B]">
                    {modalSearchQuery
                      ? "No results found"
                      : modalRoleTab === "student"
                        ? "No students available"
                        : "No admins available"}
                  </p>
                  {!modalSearchQuery && modalRoleTab === "student" && (
                    <p className="mt-1 text-xs text-[#65676B]">
                      Students will appear here once they register
                    </p>
                  )}
                </div>
              ) : (
                usersToShow.map((contact: User) => {
                  const roleInfo = getUserRoleInfo(contact.role);
                  const isSelected = selectedContacts.some(
                    (c) => c._id === contact._id,
                  );

                  return (
                    <div
                      key={contact._id}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                        isSelected ? "bg-[#E7F3FF]" : "hover:bg-[#F0F2F5]"
                      }`}
                      onClick={() =>
                        setSelectedContacts((prev) =>
                          isSelected
                            ? prev.filter((c) => c._id !== contact._id)
                            : [...prev, contact],
                        )
                      }
                    >
                      {/* Checkbox */}
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-[#0084ff] bg-[#0084ff]"
                            : "border-[#bcc0c4]"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative h-12 w-12 flex-shrink-0">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            className="h-full w-full rounded-full object-cover"
                            alt={contact.name}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#0084ff] to-[#00c6ff] text-white">
                            <span className="text-base font-medium">
                              {contact.name[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#050505]">
                            {contact.name}
                          </span>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleInfo.bg} ${roleInfo.text}`}
                          >
                            {roleInfo.label}
                          </span>
                        </div>
                        <p className="truncate text-xs text-[#65676B]">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create Button */}
            <div className="border-t border-[#e4e6eb] p-4">
              <button
                onClick={handleStartConversation}
                disabled={selectedContacts.length === 0 || isCreating}
                className="w-full rounded-full bg-[#0084ff] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0073e0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating
                  ? "Creating..."
                  : selectedContacts.length > 1
                    ? `Create Group (${selectedContacts.length})`
                    : "Start Conversation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
