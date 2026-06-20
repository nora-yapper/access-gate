"use client";

import { useEffect, useState } from "react";

function makeSessionId(): string {
  const block = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");
  return `SX-${block()}-${block()}`;
}

/**
 * Fixed corner chrome that signals "system": a live timestamp and a session ID.
 * Both are generated client-side after mount so the static page stays cacheable
 * while still feeling per-session.
 */
export function SystemChrome() {
  const [time, setTime] = useState<string>("--:--:--");
  const [sessionId, setSessionId] = useState<string>("SX-————-————");

  useEffect(() => {
    setSessionId(makeSessionId());
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none text-[10px] tracking-[0.18em] text-muted">
      <span className="absolute left-4 top-4 uppercase">SYS.TIME {time}</span>
      <span className="absolute right-4 top-4 uppercase">{sessionId}</span>
      <span className="absolute bottom-4 left-4 uppercase">REGISTRY · ONLINE</span>
      <span className="absolute bottom-4 right-4 uppercase">SECURE CHANNEL</span>
    </div>
  );
}
