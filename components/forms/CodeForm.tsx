"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

type Phase = "idle" | "checking" | "preparing" | "denied";

export function CodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<string>("");
  const attempts = useRef(0);

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
    await sleep(rand(300, 500));
    setStatus("Checking registry…");
    await sleep(rand(300, 700));

    const result = await request;

    if (result?.ok) {
      attempts.current = 0;
      setStatus("Code recognized.");
      await sleep(300);
      setPhase("preparing");
      await sleep(rand(700, 1200));
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
    <div className="fade-in">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.32em] text-muted">Registry · Checkpoint</p>
        <h1 className="mt-3 text-[15px] uppercase tracking-[0.28em] text-foreground">
          Access verification
        </h1>
      </header>

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
          {locked ? "Processing" : "Proceed"}
        </Button>
      </form>

      <div className="mt-6 min-h-[1.25rem] text-[12px] tracking-[0.06em]">
        {status && (
          <p className={phase === "denied" ? "text-danger" : "text-accent"}>
            <span className="text-muted">› </span>
            {status}
            {phase === "checking" && <span className="blink">_</span>}
          </p>
        )}
      </div>
    </div>
  );
}
