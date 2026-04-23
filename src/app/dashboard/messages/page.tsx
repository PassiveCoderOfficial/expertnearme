"use client";

import { useEffect, useRef, useState } from "react";
import { MdSend, MdSearch, MdMessage } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";

type OtherUser = { id: number; name: string; email: string; profile?: { avatar?: string } | null };
type LastMsg   = { content: string; createdAt: string; senderId: number } | null;
type Conv      = { id: number; other: OtherUser; lastMsg: LastMsg; updatedAt: string };
type Msg       = { id: number; content: string; createdAt: string; senderId: number; sender: { id: number; name: string; profile?: { avatar?: string } | null } };

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) return <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function MessagesPage() {
  const { session } = useAuth();
  const [convs, setConvs]       = useState<Conv[]>([]);
  const [active, setActive]     = useState<Conv | null>(null);
  const [msgs, setMsgs]         = useState<Msg[]>([]);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const pollRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConvs = async () => {
    const r = await fetch("/api/messages");
    const d = await r.json();
    setConvs(d.conversations || []);
    setLoading(false);
  };

  const loadMsgs = async (convId: number) => {
    const r = await fetch(`/api/messages/${convId}`);
    const d = await r.json();
    setMsgs(d.messages || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { loadConvs(); }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active.id);
    pollRef.current = setInterval(() => loadMsgs(active.id), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [active?.id]);

  const send = async () => {
    if (!active || !text.trim() || sending) return;
    setSending(true);
    const r = await fetch(`/api/messages/${active.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    if (r.ok) {
      const d = await r.json();
      setMsgs(prev => [...prev, d.message]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      loadConvs();
    }
    setSending(false);
  };

  const filtered = search
    ? convs.filter(c =>
        c.other.name.toLowerCase().includes(search.toLowerCase()) ||
        c.other.email.toLowerCase().includes(search.toLowerCase())
      )
    : convs;

  const uid = session?.userId;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-900 rounded-2xl border border-white/8 overflow-hidden">
      {/* Sidebar — conversation list */}
      <div className="w-72 shrink-0 border-r border-white/8 flex flex-col">
        <div className="px-4 py-3 border-b border-white/8">
          <h2 className="text-sm font-bold text-white mb-2">Messages</h2>
          <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5">
            <MdSearch className="text-slate-500 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-slate-500 text-xs">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <MdMessage className="text-slate-600 text-3xl mx-auto mb-2" />
              <p className="text-slate-500 text-xs">No conversations yet</p>
            </div>
          ) : filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors flex items-start gap-3 ${active?.id === c.id ? "bg-orange-500/8" : ""}`}
            >
              <Avatar name={c.other.name} src={c.other.profile?.avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white truncate">{c.other.name}</p>
                  <p className="text-[10px] text-slate-600 shrink-0 ml-1">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {c.lastMsg ? (c.lastMsg.senderId === uid ? "You: " : "") + c.lastMsg.content : "No messages yet"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
            <Avatar name={active.other.name} src={active.other.profile?.avatar} />
            <div>
              <p className="text-sm font-semibold text-white">{active.other.name}</p>
              <p className="text-xs text-slate-500">{active.other.email}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {msgs.map(m => {
              const isMe = m.senderId === uid;
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  {!isMe && <Avatar name={m.sender.name} src={m.sender.profile?.avatar} />}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-orange-500 text-slate-900 font-medium rounded-br-sm" : "bg-slate-800 text-slate-200 border border-white/8 rounded-bl-sm"}`}>
                    {m.content}
                    <p className={`text-[10px] mt-1 ${isMe ? "text-orange-900/70" : "text-slate-600"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-3 border-t border-white/8 flex items-end gap-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/40 resize-none"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center text-slate-900 transition-colors shrink-0"
            >
              <MdSend className="text-lg" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <MdMessage className="text-5xl mx-auto mb-3 text-slate-700" />
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
