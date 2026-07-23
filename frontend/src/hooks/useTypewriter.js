import { useEffect, useRef, useState } from "react";

const SPEED_MS = {
  slow: 42,
  natural: 20,
  fast: 8,
};

// Reveals `fullText` character by character with slight randomized jitter,
// like ChatGPT/Claude-style streaming. Runs once per mount (a message's text
// never changes after creation) and calls onTick after every character so
// the caller can keep the scroll pinned to the bottom.
export default function useTypewriter(fullText, { enabled = true, speed = "natural", onTick } = {}) {
  const [display, setDisplay] = useState(enabled ? "" : fullText);
  const [done, setDone] = useState(!enabled);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplay(fullText || "");
      setDone(true);
      return undefined;
    }

    let cancelled = false;
    let i = 0;
    let timeoutId = null;
    const base = SPEED_MS[speed] || SPEED_MS.natural;

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setDisplay(fullText.slice(0, i));
      onTickRef.current?.();

      if (i >= fullText.length) {
        setDone(true);
        return;
      }

      // Slight human-like variation, with a small extra pause after
      // sentence-ending punctuation so it doesn't feel mechanical.
      const lastChar = fullText[i - 1];
      const pausy = /[.!?]/.test(lastChar) ? base * 6 : /[,;:]/.test(lastChar) ? base * 3 : 0;
      const jitter = Math.random() * base * 0.7;
      timeoutId = setTimeout(tick, base + jitter + pausy);
    };

    timeoutId = setTimeout(tick, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { display, done };
}
