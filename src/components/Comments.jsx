import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useVoter } from "@/lib/useVoter";

export default function Comments({ contestantId }) {
  const { voterId } = useVoter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("fan_name") || "");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const all = await base44.entities.Comment.list("-created_date", 200);
      setComments(all.filter((c) => c.contestant_id === contestantId));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [contestantId]);

  useEffect(() => {
    load();
    const unsub = base44.entities.Comment.subscribe((event) => {
      if (event.data?.contestant_id === contestantId) load(true);
    });
    return unsub;
  }, [contestantId, load]);

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setError("");
    setPosting(true);
    const author = name.trim() || "Anonymous Fan";
    localStorage.setItem("fan_name", author);
    // Optimistic: show the comment immediately
    const tempId = `tmp-${Date.now()}`;
    setComments((prev) => [
      { id: tempId, contestant_id: contestantId, voter_id: voterId, author_name: author, text: body, created_date: new Date().toISOString() },
      ...prev,
    ]);
    setText("");
    try {
      await base44.entities.Comment.create({
        contestant_id: contestantId,
        voter_id: voterId,
        author_name: author,
        text: body,
      });
      await load(true);
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setText(body);
      setError(err.message || "Could not post comment.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5" /> Fan Comments
        <span className="text-sm font-body text-muted-foreground">({comments.length})</span>
      </h2>

      <form onSubmit={submit} className="mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={40}
          className="w-full mb-2 rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share some love for this performance…"
            maxLength={280}
            rows={2}
            className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            aria-label="Post comment"
            className="self-stretch min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black px-4 transition"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </form>

      {loading ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet — be the first to cheer them on!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{c.author_name || "Anonymous Fan"}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(c.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words select-text">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}