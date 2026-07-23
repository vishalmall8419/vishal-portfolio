import { useCallback, useEffect, useRef, useState } from "react";
import { publicApi } from "../lib/publicApi";

const HISTORY_KEY = "vm_ai_chat_history_v1";

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  } catch {
    // sessionStorage unavailable (private mode, etc.) -- chat still works,
    // it just won't survive a page reload.
  }
}

let idCounter = 0;
const nextId = () => `msg_${Date.now()}_${idCounter++}`;

export default function useAiAssistant() {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [messages, setMessages] = useState(() => loadHistory());
  const [sending, setSending] = useState(false);
  const configLoadedOnce = useRef(false);

  useEffect(() => {
    if (configLoadedOnce.current) return;
    configLoadedOnce.current = true;
    publicApi
      .aiConfig()
      .then(({ data }) => setConfig(data?.data || null))
      .catch(() => setConfig(null))
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    const question = text.trim();
    if (!question) return;

    // A new question always wins: cancel whatever request is currently in
    // flight (network request aborted, its eventual response ignored) and
    // start answering the latest one instead of queuing behind it.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const myRequestId = ++activeRequestIdRef.current;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: question, time: Date.now() }]);
    setSending(true);
    const startedAt = Date.now();
    const minThinkTime = Number(config?.responseDelay) || 0;

    try {
      const { data } = await publicApi.aiAsk(question, controller.signal);

      // A newer question was submitted while this one was in flight --
      // stop rendering this (now stale) response entirely.
      if (myRequestId !== activeRequestIdRef.current) return;

      const { answer, sources } = data?.data || {};

      const elapsed = Date.now() - startedAt;
      if (minThinkTime > elapsed) {
        await new Promise((resolve) => setTimeout(resolve, minThinkTime - elapsed));
      }

      if (myRequestId !== activeRequestIdRef.current) return;

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: answer || "I couldn't find that information.",
          sources: sources || [],
          time: Date.now(),
          fresh: true,
        },
      ]);
    } catch (err) {
      // Cancelled requests (superseded by a newer question) should never
      // render anything -- not even an error bubble.
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
      if (myRequestId !== activeRequestIdRef.current) return;

      const message =
        err?.response?.data?.message ||
        "Something went wrong reaching the assistant. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", text: message, sources: [], isError: true, time: Date.now(), fresh: true },
      ]);
    } finally {
      if (myRequestId === activeRequestIdRef.current) {
        setSending(false);
        abortControllerRef.current = null;
      }
    }
  }, [config]);

  const clearChat = useCallback(() => {
    setMessages([]);
    saveHistory([]);
  }, []);

  // Replace the active thread wholesale -- used by the AI page's chat
  // history sidebar to restore a previously saved session.
  const loadMessages = useCallback((nextMessages) => {
    setMessages(Array.isArray(nextMessages) ? nextMessages : []);
  }, []);

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.text);
  }, [messages, sendMessage]);

  return {
    config,
    configLoading,
    enabled: !!config?.enabled,
    messages,
    sending,
    sendMessage,
    clearChat,
    loadMessages,
    regenerate,
  };
}
