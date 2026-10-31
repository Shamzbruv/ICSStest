import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, X, Sparkles } from "lucide-react";
import MessageBubble from "@/components/agent/MessageBubble";

export default function VoteAdvisorChat({ open, onClose }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const init = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "vote_advisor",
          metadata: { name: "Vote Advisor" },
        });
        if (cancelled) return;
        setConversationId(conv.id);
        setMessages(conv.messages || []);
      } catch (e) {
        /* ignore */
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setBusy(false);
    });
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !conversationId || busy) return;
    setInput("");
    setBusy(true);
    try {
      const conv = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conv, { role: "user", content: text });
    } catch (e) {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[600px]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center">
              <Sparkles className="w-4 h-4 text-black" />
            </span>
            <div>
              <h3 className="font-medium leading-tight">Vote Advisor</h3>
              <p className="text-xs text-muted-foreground">Ask how to vote in battles</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close chat" className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {!conversationId ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Hi! Ask me anything about how to cast your vote during a battle.
            </p>
          ) : (
            messages.map((m, i) => <MessageBubble key={i} message={m} />)
          )}
        </div>
        <div className="p-3 border-t border-border flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            aria-label="Ask vote advisor"
            placeholder="Ask how to vote…"
            className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            onClick={send}
            aria-label="Send message"
            disabled={busy || !input.trim()}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black grid place-items-center"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}