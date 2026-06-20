"use client";

import { useEffect, useState } from "react";

const STEPS = ["Entry recorded.", "Registry updated.", "You will be contacted."];

/**
 * Final screen. Reveals the system messages one by one, then settles with the
 * entry id and a quiet warning. No buttons, no links — the user sits with it.
 */
export function ConfirmationSequence({ entryId }: { entryId: string }) {
  const [visible, setVisible] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), 500 + i * 850));
    });
    timers.push(setTimeout(() => setSettled(true), 500 + STEPS.length * 850));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fade-in">
      <p className="mb-8 text-[10px] uppercase tracking-[0.32em] text-muted">
        Registry · Confirmation
      </p>

      <div className="space-y-3">
        {STEPS.map((line, i) => (
          <p
            key={line}
            className={
              "text-[14px] uppercase tracking-[0.24em] transition-opacity duration-500 " +
              (i < visible ? "fade-in text-foreground opacity-100" : "opacity-0")
            }
          >
            <span className="text-accent">› </span>
            {line}
          </p>
        ))}
      </div>

      <div
        className={
          "mt-12 border-t border-t-[color:var(--line)] pt-5 transition-opacity duration-700 " +
          (settled ? "opacity-100" : "opacity-0")
        }
      >
        <p className="text-[12px] uppercase tracking-[0.28em] text-accent">
          Entry ID: {entryId}
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted">
          Do not share your access code.
        </p>
      </div>
    </div>
  );
}
