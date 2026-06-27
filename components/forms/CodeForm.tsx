"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

type Phase = "idle" | "checking" | "preparing" | "denied";

const VISITOR = "Visitor Detected";

export function CodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<string>("");
  const attempts = useRef(0);
  const [revealStep, setRevealStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const hasRevealed = useRef(false);

  useEffect(() => {
    if (hasRevealed.current) {
      setRevealStep(3);
      setTypedChars(VISITOR.length);
      return;
    }
    hasRevealed.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setRevealStep(1), 0));

    for (let i = 0; i < VISITOR.length; i++) {
      timers.push(setTimeout(() => setTypedChars(i + 1), 120 + i * 65));
    }

    const doneTyping = 120 + VISITOR.length * 65;
    timers.push(setTimeout(() => setRevealStep(2), doneTyping + 180));
    timers.push(setTimeout(() => setRevealStep(3), doneTyping + 420));

    return () => timers.forEach(clearTimeout);
  }, []);

  const locked = phase === "checking" || phase === "preparing";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || !code.trim()) return;

    setPhase("checking");

    // Fire the request immediately, run the procedural sequence in parallel.
    const request = fetch("/api/validate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }));

    setStatus("Verifying code…");
    await sleep(rand(600, 1200));
    const result = await request;

    if (result?.ok) {
      attempts.current = 0;
      setStatus("Code recognized.");
      await sleep(300);
      setPhase("preparing");
      await sleep(rand(1400, 1800));
      router.push("/register");
      return;
    }

    // Failure path.
    attempts.current += 1;
    setPhase("denied");
    setStatus("Code not found.");
    await sleep(500);
    setStatus("Access denied.");
    await sleep(700);

    if (attempts.current >= 3) {
      setStatus("Repeated invalid attempts detected.");
      await sleep(900);
    }
    setPhase("idle");
    setStatus("");
  }

  // Full-screen intermediate state.
  if (phase === "preparing") {
    return (
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background text-center">
        <p className="fade-in text-[13px] uppercase tracking-[0.3em] text-foreground">
          Preparing access…
        </p>
        <p className="text-[12px] uppercase tracking-[0.3em] text-muted">
          Stand by<span className="blink">_</span>
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10">
        {revealStep >= 1 && (
          <p className="text-[11px] sm:text-[10px] uppercase tracking-[0.32em] text-muted">
            {VISITOR.slice(0, typedChars)}
            {typedChars < VISITOR.length && <span className="blink">_</span>}
          </p>
        )}
        {revealStep >= 2 && (
          <h1 className="fade-in mt-3 text-[17px] sm:text-[15px] uppercase tracking-[0.28em] text-foreground">
            Access verification
          </h1>
        )}
      </header>

      {revealStep >= 3 && (
        <div className="fade-in">
          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              id="code"
              label="Access code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              placeholder="________"
              value={code}
              disabled={locked}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" disabled={locked || !code.trim()}>
              {locked ? "Processing" : "Enter"}
            </Button>
          </form>

          <div className="mt-6 min-h-[1.25rem] text-[13px] sm:text-[12px] tracking-[0.06em]">
            {status && (
              <p className={phase === "denied" ? "text-danger" : "text-accent"}>
                <span className="text-muted">› </span>
                {status}
                {phase === "checking" && <span className="blink">_</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
