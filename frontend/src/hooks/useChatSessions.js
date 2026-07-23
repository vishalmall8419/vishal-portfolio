import { useCallback, useEffect, useRef, useState } from "react";

const SESSIONS_KEY = "vm_ai_chat_sessions_v1";
const MAX_SESSIONS = 25;

function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage unavailable -- history just won't persist across reloads.
  }
}

function titleFromMessages(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.text.trim();
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

let sessionIdCounter = 0;
const nextSessionId = () => `session_${Date.now()}_${sessionIdCounter++}`;

// Wraps useAiAssistant to give the AI page a sidebar-style multi-session
// history (New Chat / Chat History / Clear All Chats), purely on the
// frontend -- the retrieval backend itself stays stateless per request.
export default function useChatSessions(ai) {
  const [sessions, setSessions] = useState(() => loadSessions());
  const activeSessionId = useRef(sessions[0]?.id || null);

  // Keep the active session's snapshot in sync with the live conversation.
  useEffect(() => {
    if (ai.messages.length === 0) return;

    if (!activeSessionId.current) {
      activeSessionId.current = nextSessionId();
    }

    setSessions((prev) => {
      const id = activeSessionId.current;
      const existingIdx = prev.findIndex((s) => s.id === id);
      const entry = {
        id,
        title: titleFromMessages(ai.messages),
        messages: ai.messages,
        updatedAt: Date.now(),
      };

      let next;
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = entry;
      } else {
        next = [entry, ...prev];
      }

      next.sort((a, b) => b.updatedAt - a.updatedAt);
      next = next.slice(0, MAX_SESSIONS);

      saveSessions(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.messages]);

  const newChat = useCallback(() => {
    activeSessionId.current = null;
    ai.clearChat();
  }, [ai]);

  const openSession = useCallback(
    (id) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return;
      activeSessionId.current = id;
      ai.loadMessages(session.messages);
    },
    [ai, sessions]
  );

  const clearAll = useCallback(() => {
    activeSessionId.current = null;
    setSessions([]);
    saveSessions([]);
    ai.clearChat();
  }, [ai]);

  return {
    sessions,
    activeSessionId: activeSessionId.current,
    newChat,
    openSession,
    clearAll,
  };
}
