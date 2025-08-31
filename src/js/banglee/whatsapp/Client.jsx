import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Send,
  Users,
  MessageCircle,
  Radio,
  QrCode,
  X,
  PlusCircle,
  UserPlus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Archive,
  BellRing,
} from "lucide-react";

export default function WhatsappHome() {
  const [status, setStatus] = useState("disconnected");
  const [qr, setQr] = useState(null);
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("chats");
  const [groupMembers, setGroupMembers] = useState([]);
  const [channelMembers, setChannelMembers] = useState([]);
  const [showAddChannelMember, setShowAddChannelMember] = useState(false);
  const [newChannelId, setNewChannelId] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelMemberId, setNewChannelMemberId] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("/wa");
    socketRef.current.on("status", ({ status }) => setStatus(status));
    socketRef.current.on("qr", (code) => setQr(code));
    socketRef.current.on("chats", (data) => setChats(data));
    socketRef.current.on("groups", (data) => setGroups(data));
    socketRef.current.on("channel_messages", ({ channelId, messages }) => {
      if (activeChat === channelId) setMessages(messages);
    });
    socketRef.current.on("chat_messages", ({ jid, messages }) => {
      if (activeChat === jid) setMessages(messages);
    });
    socketRef.current.on("new_message", (msg) => {
      if (activeChat && (msg.key.remoteJid === activeChat)) {
        setMessages((prev) => [msg, ...prev]);
      }
    });
    socketRef.current.on("group_members", ({ jid, subject, members }) => {
      if (activeChat === jid) setGroupMembers(members);
    });
    socketRef.current.on("channel_members", ({ channelId, members }) => {
      if (activeChat === channelId) setChannelMembers(members);
    });
    socketRef.current.on("channels_list", (channels) => {
      setChannels(channels || [])
    });
    socketRef.current.on("channel_created", (channel) => {
      setChannels((prev) => [...prev, channel]);
      setNewChannelId("");
      setNewChannelName("");
    });
    socketRef.current.on("channel_member_added", ({ channelId, contactId }) => {
      if (activeChat === channelId) {
        setChannelMembers((prev) => [...prev, { id: contactId }]);
      }
      setNewChannelMemberId("");
      setShowAddChannelMember(false);
    });
    socketRef.current.on("broadcast_result", ({ channelId, result }) => {
      alert(
        `Broadcast to channel ${channelId} completed.\n` +
          result
            .map(
              (r) =>
                `${r.jid}: ${r.status}${r.error ? ` (${r.error})` : ""}`
            )
            .join("\n")
      );
    });
    socketRef.current.on("error", ({ message }) => {
      alert(`Error: ${message}`);
    });

    loadChats();
    loadGroups();
    loadChannels();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [activeChat]);

  const loadChats = () => {
    setLoading(true);
    socketRef.current.emit("get_chats");
    setTimeout(() => setLoading(false), 1000);
  };
  const loadGroups = () => {
    setLoading(true);
    socketRef.current.emit("get_groups");
    setTimeout(() => setLoading(false), 1000);
  };
  const loadChannels = () => {
    socketRef.current.emit("get_channels");
  };

  const loadMessages = (jid) => {
    setActiveChat(jid);
    setMessages([]);
    setGroupMembers([]);
    setChannelMembers([]);
    if (jid.endsWith("@g.us")) {
      socketRef.current.emit("get_group_members", { jid });
    }
    socketRef.current.emit("get_chat_messages", { jid });
  };

  const loadChannelMessages = (channelId) => {
    setActiveChat(channelId);
    setMessages([]);
    setGroupMembers([]);
    setChannelMembers([]);
    socketRef.current.emit("get_channel_members", { channelId });
    socketRef.current.emit("get_channel_messages", { channelId });
  };

  const sendMessage = () => {
    if (!activeChat || !text.trim()) return;
    if (activeTab === "channels") {
      socketRef.current.emit("broadcast_message", { channelId: activeChat, text });
    } else {
      socketRef.current.emit("send_message", { jid: activeChat, text });
    }
    setText("");
  };

  const createChannel = () => {
    if (!newChannelId.trim() || !newChannelName.trim()) {
      alert("Channel ID and Name are required");
      return;
    }
    socketRef.current.emit("create_channel", { id: newChannelId.trim(), name: newChannelName.trim() });
  };

  const addChannelMember = () => {
    if (!newChannelMemberId.trim()) {
      alert("Contact ID is required");
      return;
    }
    socketRef.current.emit("add_channel_member", { channelId: activeChat, contactId: newChannelMemberId.trim() });
  };

  return (
    <div className="xpo_flex xpo_h-screen xpo_bg-gray-50 xpo_select-none">
      <div className="xpo_w-80 xpo_bg-white xpo_border-r xpo_flex xpo_flex-col">
        <div className="xpo_p-4 xpo_border-b xpo_flex xpo_items-center xpo_justify-between">
          <h1 className="xpo_text-2xl xpo_font-extrabold xpo_text-blue-700">WhatsApp Client</h1>
          <div
            className={`xpo_text-sm xpo_font-semibold ${
              status === "connected" ? "xpo_text-green-600" : "xpo_text-red-600"
            } xpo_flex xpo_items-center xpo_gap-1`}
            title={`Status: ${status}`}
          >
            <BellRing className="xpo_w-5 xpo_h-5" />
            {status}
          </div>
        </div>

        <div className="xpo_flex xpo_justify-around xpo_gap-2 xpo_border-b xpo_bg-gray-100 xpo_py-3">
          <button
            onClick={() => {
              setActiveTab("chats");
              loadChats();
              setActiveChat(null);
              setMessages([]);
              setGroupMembers([]);
              setChannelMembers([]);
            }}
            className={`xpo_flex xpo_items-center xpo_gap-2 xpo_font-semibold xpo_uppercase xpo_text-xs xpo_tracking-wide ${
              activeTab === "chats"
                ? "xpo_text-blue-600 xpo_border-b-2 xpo_border-blue-600"
                : "xpo_text-gray-500 hover:xpo_text-blue-500"
            }`}
            aria-label="Chats"
          >
            <MessageCircle className="xpo_w-5 xpo_h-5" />
            Chats
          </button>
          <button
            onClick={() => {
              setActiveTab("groups");
              loadGroups();
              setActiveChat(null);
              setMessages([]);
              setGroupMembers([]);
              setChannelMembers([]);
            }}
            className={`xpo_flex xpo_items-center xpo_gap-2 xpo_font-semibold xpo_uppercase xpo_text-xs xpo_tracking-wide ${
              activeTab === "groups"
                ? "xpo_text-blue-600 xpo_border-b-2 xpo_border-blue-600"
                : "xpo_text-gray-500 hover:xpo_text-blue-500"
            }`}
            aria-label="Groups"
          >
            <Users className="xpo_w-5 xpo_h-5" />
            Groups
          </button>
          <button
            onClick={() => {
              setActiveTab("channels");
              loadChannels();
              setActiveChat(null);
              setMessages([]);
              setGroupMembers([]);
              setChannelMembers([]);
            }}
            className={`xpo_flex xpo_items-center xpo_gap-2 xpo_font-semibold xpo_uppercase xpo_text-xs xpo_tracking-wide ${
              activeTab === "channels"
                ? "xpo_text-blue-600 xpo_border-b-2 xpo_border-blue-600"
                : "xpo_text-gray-500 hover:xpo_text-blue-500"
            }`}
            aria-label="Channels"
          >
            <Radio className="xpo_w-5 xpo_h-5" />
            Channels
          </button>
        </div>

        <div className="xpo_flex-1 xpo_overflow-y-auto xpo_scrollbar-thin xpo_scrollbar-thumb-rounded xpo_scrollbar-thumb-gray-300 xpo_scrollbar-track-gray-100">
          {loading && (
            <div className="xpo_p-4 xpo_text-center xpo_text-gray-400 xpo_select-none">
              Loading...
            </div>
          )}

          {!loading && activeTab === "chats" && chats.length === 0 && (
            <div className="xpo_p-4 xpo_text-center xpo_text-gray-400">No chats found</div>
          )}
          {!loading &&
            activeTab === "chats" &&
            chats.map((c) => (
              <div
                key={c.id}
                onClick={() => loadMessages(c.id)}
                className={`xpo_p-3 xpo_cursor-pointer xpo_border-b xpo_border-gray-100 xpo_transition-colors xpo_duration-150 hover:xpo_bg-blue-50 ${
                  activeChat === c.id ? "xpo_bg-blue-100" : ""
                }`}
                title={c.id}
              >
                <p className="xpo_font-semibold xpo_text-sm xpo_truncate">{c.id}</p>
                <p className="xpo_text-xs xpo_text-gray-500">{new Date(c.last_activity).toLocaleString()}</p>
              </div>
            ))}

          {!loading && activeTab === "groups" && groups.length === 0 && (
            <div className="xpo_p-4 xpo_text-center xpo_text-gray-400">No groups found</div>
          )}
          {!loading &&
            activeTab === "groups" &&
            groups.map((g) => (
              <div
                key={g.id}
                onClick={() => loadMessages(g.id)}
                className={`xpo_p-3 xpo_cursor-pointer xpo_border-b xpo_border-gray-100 xpo_transition-colors xpo_duration-150 hover:xpo_bg-green-50 ${
                  activeChat === g.id ? "xpo_bg-green-100" : ""
                }`}
                title={g.subject || g.id}
              >
                <p className="xpo_font-semibold xpo_text-sm xpo_truncate">{g.subject || g.id}</p>
              </div>
            ))}

          {!loading && activeTab === "channels" && channels.length === 0 && (
            <div className="xpo_p-4 xpo_text-center xpo_text-gray-400">No channels found</div>
          )}
          {!loading &&
            activeTab === "channels" &&
            channels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => loadChannelMessages(ch.id)}
                className={`xpo_p-3 xpo_cursor-pointer xpo_border-b xpo_border-gray-100 xpo_transition-colors xpo_duration-150 hover:xpo_bg-purple-50 ${
                  activeChat === ch.id ? "xpo_bg-purple-100" : ""
                }`}
                title={ch.name}
              >
                <p className="xpo_font-semibold xpo_text-sm xpo_truncate">{ch.name}</p>
              </div>
            ))}
        </div>

        {activeTab === "channels" && (
          <div className="xpo_p-3 xpo_border-t xpo_bg-gray-50 xpo_flex xpo_items-center xpo_gap-2">
            <input
              type="text"
              placeholder="New Channel ID"
              value={newChannelId}
              onChange={(e) => setNewChannelId(e.target.value)}
              className="xpo_flex-1 xpo_border xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-purple-400"
            />
            <input
              type="text"
              placeholder="New Channel Name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="xpo_flex-1 xpo_border xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-purple-400"
            />
            <button
              onClick={createChannel}
              className="xpo_bg-purple-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md hover:xpo_bg-purple-700 xpo_flex xpo_items-center xpo_gap-1"
              aria-label="Create Channel"
            >
              <PlusCircle className="xpo_w-5 xpo_h-5" />
              Create
            </button>
          </div>
        )}
      </div>

      <div className="xpo_flex-1 xpo_flex xpo_flex-col">
        {qr && (
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_flex-1 xpo_p-8 xpo_bg-white xpo_m-8 xpo_rounded-lg xpo_shadow-lg">
            <QrCode className="xpo_w-16 xpo_h-16 xpo_text-blue-600 xpo_mb-4" />
            <p className="xpo_text-lg xpo_font-semibold xpo_mb-4">Scan this QR Code with WhatsApp</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}`}
              alt="WhatsApp QR Code"
              className="xpo_w-72 xpo_h-72 xpo_shadow-md xpo_rounded-lg"
            />
            <button
              onClick={() => setQr(null)}
              className="xpo_mt-6 xpo_text-sm xpo_text-blue-600 hover:xpo_underline"
            >
              Hide QR
            </button>
          </div>
        )}

        {!qr && !activeChat && (
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_flex-1 xpo_text-gray-400 xpo_text-center xpo_p-8">
            <MessageSquare className="xpo_w-20 xpo_h-20 xpo_mb-4" />
            <p className="xpo_text-xl xpo_font-semibold">Select a chat, group, or channel</p>
            <p className="xpo_mt-2">or scan QR code to connect WhatsApp</p>
          </div>
        )}

        {!qr && activeChat && (
          <>
            <div className="xpo_p-4 xpo_border-b xpo_bg-white xpo_flex xpo_items-center xpo_justify-between xpo_shadow-sm">
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <button
                  onClick={() => {
                    setActiveChat(null);
                    setMessages([]);
                    setGroupMembers([]);
                    setChannelMembers([]);
                  }}
                  className="xpo_p-1 xpo_rounded-full xpo_hover_bg-gray-200"
                  aria-label="Back"
                >
                  <ChevronLeft className="xpo_w-6 xpo_h-6" />
                </button>
                <div>
                  <p className="xpo_font-bold xpo_text-lg xpo_truncate max-w-xs">
                    {activeTab === "groups"
                      ? groups.find((g) => g.id === activeChat)?.subject || activeChat
                      : activeTab === "channels"
                      ? channels.find((ch) => ch.id === activeChat)?.name || activeChat
                      : activeChat}
                  </p>
                  {activeTab === "groups" && (
                    <p className="xpo_text-xs xpo_text-gray-500">
                      {groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}
                    </p>
                  )}
                  {activeTab === "channels" && (
                    <p className="xpo_text-xs xpo_text-gray-500">
                      {channelMembers.length} member{channelMembers.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {activeTab === "channels" && (
                <button
                  onClick={() => setShowAddChannelMember((v) => !v)}
                  className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-purple-600 hover:xpo_underline xpo_font-semibold"
                  aria-label="Add Channel Member"
                >
                  <UserPlus className="xpo_w-5 xpo_h-5" />
                  Add Member
                </button>
              )}
            </div>

            {activeTab === "groups" && groupMembers.length > 0 && (
              <div className="xpo_px-4 xpo_py-2 xpo_bg-gray-50 xpo_border-b xpo_overflow-x-auto xpo_whitespace-nowrap">
                {groupMembers.map((m) => (
                  <div
                    key={m.jid}
                    className="xpo_inline-block xpo_bg-green-200 xpo_text-green-800 xpo_text-xs xpo_font-semibold xpo_px-3 xpo_py-1 xpo_rounded-full xpo_mr-2"
                    title={m.jid + (m.is_admin ? " (Admin)" : "")}
                  >
                    {m.jid.split("@")[0]}
                    {m.is_admin && (
                                         <Users className="xpo_inline-block xpo_w-3 xpo_h-3 xpo_ml-1" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "channels" && showAddChannelMember && (
              <div className="xpo_p-4 xpo_bg-purple-50 xpo_border-b xpo_flex xpo_items-center xpo_gap-2">
                <input
                  type="text"
                  placeholder="Contact ID to add"
                  value={newChannelMemberId}
                  onChange={(e) => setNewChannelMemberId(e.target.value)}
                  className="xpo_flex-1 xpo_border xpo_rounded-md xpo_px-3 xpo_py-2 xpo_text-sm xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-purple-400"
                />
                <button
                  onClick={addChannelMember}
                  className="xpo_bg-purple-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md hover:xpo_bg-purple-700 xpo_flex xpo_items-center xpo_gap-1"
                  aria-label="Add Member"
                >
                  <UserPlus className="xpo_w-5 xpo_h-5" />
                  Add
                </button>
                <button
                  onClick={() => setShowAddChannelMember(false)}
                  className="xpo_text-purple-600 xpo_p-2 xpo_rounded-md hover:xpo_bg-purple-100"
                  aria-label="Cancel"
                >
                  <X className="xpo_w-5 xpo_h-5" />
                </button>
              </div>
            )}

            {activeTab === "channels" && channelMembers.length > 0 && (
              <div className="xpo_px-4 xpo_py-2 xpo_bg-purple-50 xpo_border-b xpo_overflow-x-auto xpo_whitespace-nowrap">
                {channelMembers.map((m) => (
                  <div
                    key={m.id}
                    className="xpo_inline-block xpo_bg-purple-200 xpo_text-purple-800 xpo_text-xs xpo_font-semibold xpo_px-3 xpo_py-1 xpo_rounded-full xpo_mr-2"
                    title={m.id}
                  >
                    {m.id.split("@")[0]}
                  </div>
                ))}
              </div>
            )}

            <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_bg-white xpo_scrollbar-thin xpo_scrollbar-thumb-rounded xpo_scrollbar-thumb-gray-300 xpo_scrollbar-track-gray-100">
              {messages.length === 0 && (
                <div className="xpo_text-center xpo_text-gray-400 xpo_select-none xpo_mt-10">
                  No messages yet
                </div>
              )}
              {messages.map((m) => {
                const fromMe = m.from_me || m.key?.fromMe;
                const body = m.body || m.message?.conversation || "[No text]";
                return (
                  <div
                    key={m.id || m.key?.id}
                    className={`xpo_max-w-xl xpo_break-words xpo_p-3 xpo_rounded-lg xpo_mb-2 ${
                      fromMe
                        ? "xpo_bg-blue-600 xpo_text-white xpo_self-end"
                        : "xpo_bg-gray-200 xpo_text-gray-900 xpo_self-start"
                    }`}
                    title={new Date(m.timestamp || m.messageTimestamp * 1000 || Date.now()).toLocaleString()}
                  >
                    {body}
                  </div>
                );
              })}
            </div>

            <div className="xpo_p-4 xpo_border-t xpo_bg-gray-50 xpo_flex xpo_items-center xpo_gap-3">
              <input
                type="text"
                placeholder={
                  activeTab === "channels"
                    ? "Type message to broadcast..."
                    : "Type a message..."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="xpo_flex-1 xpo_border xpo_rounded-full xpo_px-4 xpo_py-2 xpo_text-sm xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-400 resize-none"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className={`xpo_p-3 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center ${
                  text.trim()
                    ? "xpo_bg-blue-600 xpo_text-white hover:xpo_bg-blue-700"
                    : "xpo_bg-gray-300 xpo_text-gray-500 cursor-not-allowed"
                }`}
                aria-label="Send Message"
              >
                <Send className="xpo_w-5 xpo_h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
