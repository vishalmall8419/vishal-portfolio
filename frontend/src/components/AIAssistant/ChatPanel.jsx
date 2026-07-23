import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSend,
  FiTrash2,
  FiUser,
  FiCopy,
  FiCheck,
  FiMic,
  FiPaperclip,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
} from "react-icons/fi";
import { resolveAssetUrl } from "../../lib/publicApi";
import { gsap } from "../../lib/gsap";
import useTypewriter from "../../hooks/useTypewriter";
import "./ChatPanel.css";

function formatTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Turns a plain-text answer into paragraphs / bullet lists / numbered lists,
// and auto-links bare URLs -- a lightweight formatter matched to what the
// retrieval engine actually returns (plain sentences), not a full Markdown
// parser.
function linkify(line, keyPrefix) {
  const parts = line.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={`${keyPrefix}-${i}`} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

function formatMessageText(text) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim().length);
    if (lines.length === 0) return null;

    const isBulletBlock = lines.every((l) => /^[-•]\s+/.test(l.trim()));
    const isNumberBlock = lines.every((l) => /^\d+[.)]\s+/.test(l.trim()));

    if (isBulletBlock) {
      return (
        <ul key={bi} className="ai-msg-list">
          {lines.map((l, li) => (
            <li key={li}>{linkify(l.replace(/^[-•]\s+/, ""), `${bi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    if (isNumberBlock) {
      return (
        <ol key={bi} className="ai-msg-list">
          {lines.map((l, li) => (
            <li key={li}>{linkify(l.replace(/^\d+[.)]\s+/, ""), `${bi}-${li}`)}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={bi}>
        {lines.map((l, li) => (
          <span key={li}>
            {linkify(l, `${bi}-${li}`)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function ThinkingCard({ avatarUrl, name, text }) {
  return (
    <div className="ai-msg ai-msg-assistant">
      <div className="ai-thinking-card">
        <div className="ai-thinking-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={name} /> : <FiUser />}
        </div>
        <div className="ai-thinking-body">
          <span className="ai-thinking-text">{text}</span>
          <span className="ai-thinking-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLast, typingEnabled, typingSpeed, onTick, onRegenerate }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null); // "up" | "down" | null -- UI-ready only

  const shouldType = !isUser && !!message.fresh && typingEnabled;
  const { display, done } = useTypewriter(message.text, {
    enabled: shouldType,
    speed: typingSpeed,
    onTick,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable -- silently ignore, nothing critical breaks.
    }
  };

  const renderedText = done ? (
    formatMessageText(message.text)
  ) : (
    <p>
      {display}
      <span className="ai-caret" />
    </p>
  );

  return (
    <div className={`ai-msg ${isUser ? "ai-msg-user" : "ai-msg-assistant"}`}>
      <div className={`ai-bubble ${message.isError ? "is-error" : ""}`}>
        {renderedText}

        {done && message.sources && message.sources.length > 0 && (
          <div className="ai-sources">
            {message.sources.map((s) => (
              <Link key={`${s.type}-${s.title}`} to={s.url} className="ai-source-chip">
                {s.title}
              </Link>
            ))}
          </div>
        )}

        {(isUser || done) && (
          <div className="ai-bubble-meta">
            <span className="ai-bubble-time">{formatTime(message.time)}</span>

            {!isUser && (
              <span className="ai-bubble-actions">
                <button type="button" className="ai-copy-btn" onClick={handleCopy} aria-label="Copy response" title="Copy response">
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
                <button
                  type="button"
                  className={`ai-copy-btn ${reaction === "up" ? "is-active" : ""}`}
                  onClick={() => setReaction((r) => (r === "up" ? null : "up"))}
                  aria-label="Good response"
                  title="Good response"
                >
                  <FiThumbsUp />
                </button>
                <button
                  type="button"
                  className={`ai-copy-btn ${reaction === "down" ? "is-active" : ""}`}
                  onClick={() => setReaction((r) => (r === "down" ? null : "down"))}
                  aria-label="Bad response"
                  title="Bad response"
                >
                  <FiThumbsDown />
                </button>
                {isLast && (
                  <button
                    type="button"
                    className="ai-copy-btn"
                    onClick={onRegenerate}
                    aria-label="Regenerate response"
                    title="Regenerate response"
                  >
                    <FiRefreshCw />
                  </button>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ChatPanel = forwardRef(function ChatPanel({ ai, compact = false }, ref) {
  const { config, messages, sending, sendMessage, clearChat, regenerate } = ai;
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => inputRef.current?.focus(),
  }));

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const showWelcome = messages.length === 0;

  useEffect(() => {
    if (!showWelcome || !welcomeRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        welcomeRef.current,
        { autoAlpha: 0, y: 24, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }, welcomeRef);
    return () => ctx.revert();
  }, [showWelcome]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const avatarUrl = resolveAssetUrl(config?.avatar);
  const botName = config?.name || "VP-ChatBot";
  const typingEnabled = config?.typingAnimationEnabled !== false;
  const typingSpeed = config?.typingSpeed || "natural";
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className={`ai-chat-panel ${compact ? "is-compact" : ""}`}>
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <div className="ai-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={botName} /> : <FiUser />}
          </div>
          <div>
            <strong>{botName}</strong>
            <span>{config?.status || "Online"} · Answers from this portfolio only</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="ai-clear-btn" onClick={clearChat} title="Clear chat">
            <FiTrash2 />
          </button>
        )}
      </div>

      <div className="ai-chat-body" ref={scrollRef}>
        {showWelcome && (
          <div className="ai-welcome" ref={welcomeRef}>
            <div className="ai-welcome-avatar">
              {avatarUrl ? <img src={avatarUrl} alt={botName} /> : <FiUser />}
            </div>
            <h3>{config?.welcomeTitle || `✨ Welcome to ${botName}`}</h3>
            <p>{config?.welcomeMessage || "Ask me anything about this portfolio."}</p>
          </div>
        )}

        {messages.length === 0 && !sending && config?.emptyChatMessage && (
          <p className="ai-empty-message">{config.emptyChatMessage}</p>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isLast={m.id === lastAssistantId}
            typingEnabled={typingEnabled}
            typingSpeed={typingSpeed}
            onTick={scrollToBottom}
            onRegenerate={regenerate}
          />
        ))}

        {sending && (
          <ThinkingCard
            avatarUrl={avatarUrl}
            name={botName}
            text={config?.typingIndicatorText || `${botName} is thinking...`}
          />
        )}

        {showWelcome && config?.suggestedQuestions?.length > 0 && (
          <div className="ai-suggested">
            {config.suggestedQuestions.map((q) => (
              <button key={q} className="ai-suggested-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <form className="ai-chat-input-row" onSubmit={handleSubmit}>
        <button
          type="button"
          className="ai-icon-btn"
          aria-label="Attach a file (coming soon)"
          title="Attach a file (coming soon)"
        >
          <FiPaperclip />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config?.placeholder || "Ask about skills, projects, experience…"}
          disabled={sending}
        />
        <button
          type="button"
          className="ai-icon-btn"
          aria-label="Voice input (coming soon)"
          title="Voice input (coming soon)"
        >
          <FiMic />
        </button>
        <button type="submit" disabled={sending || !input.trim()} aria-label="Send">
          <FiSend />
        </button>
      </form>
    </div>
  );
});

export default ChatPanel;
