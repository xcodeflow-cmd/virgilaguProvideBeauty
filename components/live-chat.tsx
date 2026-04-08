"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type LiveChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
  };
};

export function LiveChat({ liveSessionId }: { liveSessionId: string }) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      const response = await fetch(`/api/live-chat?liveSessionId=${encodeURIComponent(liveSessionId)}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        if (!cancelled) {
          setError("Chat indisponibil momentan.");
        }
        return;
      }

      const data = (await response.json()) as { messages: LiveChatMessage[] };

      if (!cancelled) {
        setMessages(data.messages);
        setError(null);
      }
    }

    void loadMessages();
    const interval = window.setInterval(() => {
      void loadMessages();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [liveSessionId]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    setIsSending(true);
    setError(null);

    const response = await fetch("/api/live-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        liveSessionId,
        content: trimmed
      })
    });

    setIsSending(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Mesajul nu a putut fi trimis.");
      return;
    }

    const data = (await response.json()) as { messages: LiveChatMessage[] };
    setMessages(data.messages);
    setMessage("");
  }

  return (
    <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Chat LIVE</p>
          <h3 className="mt-3 text-2xl text-white">Conversatie in timp real pentru abonati</h3>
        </div>
        <p className="text-sm text-white/50">{messages.length} mesaje</p>
      </div>

      <div className="mt-6 h-72 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        {messages.length ? (
          <div className="space-y-4">
            {messages.map((item, index) => (
              <div key={item.id} ref={index === messages.length - 1 ? lastMessageRef : null}>
                <p className="text-sm font-medium text-white">{item.user.name}</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-white/50">
            Chatul este activ. Primul mesaj poate fi trimis acum.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          placeholder="Scrie un mesaj"
          className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          Trimite
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
