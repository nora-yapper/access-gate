"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

type Phase = "entering" | "ready" | "submitting" | "error";

const WELCOME = "Welcome";
const PARA_LINES = [
  "Project01 is ready.",
  "Build your startup, step by step.",
  "Before public launch, we're inviting you to get early access.",
  "To continue, enter your name and email below.",
];

export function RegistrationForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("entering");
  const [entryLine, setEntryLine] = useState("Session active.");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [revealStep, setRevealStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const hasRevealed = useRef(false);

  // Procedural entry sequence before revealing the form.
  useEffect(() => {
    let active = true;
    (async () => {
      await sleep(rand(800, 1200));
      if (!active) return;
      setEntryLine("Access granted.");
      await sleep(rand(800, 1200));
      if (!active) return;
      setPhase("ready");
    })();
    return () => { active = false; };
  }, []);

  // Staggered form reveal with typewriter on heading.
  useEffect(() => {
    if (phase !== "ready") return;
    if (hasRevealed.current) {
      setRevealStep(3);
      setTypedChars(WELCOME.length);
      return;
    }
    hasRevealed.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setRevealStep(1), 0));

    for (let i = 0; i < WELCOME.length; i++) {
      timers.push(setTimeout(() => setTypedChars(i + 1), 120 + i * 65));
    }

    const doneTyping = 120 + WELCOME.length * 65;
    timers.push(setTimeout(() => setRevealStep(2), doneTyping + 180));
    timers.push(setTimeout(() => setRevealStep(3), doneTyping + 420));

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const submitting = phase === "submitting";

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const canSubmit = form.fullName.trim() && form.email.trim() && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setPhase("submitting");

    const request = fetch("/api/submit-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Connection failed." }));

    setStatus("Submitting…");
    await sleep(300);
    setStatus("Confirming information…");
    await sleep(rand(400, 700));

    const result = await request;

    if (!result?.ok) {
      setPhase("error");
      setStatus(result?.error || "Entry rejected.");
      await sleep(1100);
      if (result?.error === "Session expired.") {
        router.push("/");
        return;
      }
      setPhase("ready");
      setStatus("");
      return;
    }

    setStatus("Finalizing…");
    await sleep(300);
    router.push("/confirmation");
  }

  if (phase === "entering") {
    return (
      <div className="fade-in text-[14px] sm:text-[13px] uppercase tracking-[0.28em] text-accent">
        <span className="text-muted">› </span>
        {entryLine}
        <span className="blink">_</span>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10">
        {revealStep >= 1 && (
          <h1 className="mt-3 text-[17px] sm:text-[15px] uppercase tracking-[0.28em] text-foreground">
            {WELCOME.slice(0, typedChars)}
            {typedChars < WELCOME.length && <span className="blink">_</span>}
          </h1>
        )}
        {revealStep >= 2 && (
          <div className="mt-6 space-y-0.5 text-[13px] sm:text-[12px] leading-relaxed tracking-[0.06em] text-muted">
            {PARA_LINES.map((line, i) => (
              <p
                key={line}
                className="fade-in"
                style={{ animationDelay: `${i * 110}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </header>

      {revealStep >= 3 && (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="fade-in" style={{ animationDelay: "0ms" }}>
            <Input
              id="fullName"
              label="Full name"
              autoComplete="name"
              value={form.fullName}
              disabled={submitting}
              onChange={update("fullName")}
            />
          </div>
          <div className="fade-in" style={{ animationDelay: "110ms" }}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              value={form.email}
              disabled={submitting}
              onChange={update("email")}
            />
          </div>
          <div className="fade-in" style={{ animationDelay: "220ms" }}>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Processing" : "Continue"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 min-h-[1.25rem] text-[13px] sm:text-[12px] tracking-[0.06em]">
        {status && (
          <p className={phase === "error" ? "text-danger" : "text-accent"}>
            <span className="text-muted">› </span>
            {status}
            {submitting && <span className="blink">_</span>}
          </p>
        )}
      </div>
    </div>
  );
}
