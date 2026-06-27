"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

type Phase = "entering" | "ready" | "submitting" | "error";

export function RegistrationForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("entering");
  const [entryLine, setEntryLine] = useState("Session active.");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "" });

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
    return () => {
      active = false;
    };
  }, []);

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
      <div className="fade-in text-[13px] uppercase tracking-[0.28em] text-accent">
        <span className="text-muted">› </span>
        {entryLine}
        <span className="blink">_</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.32em] text-muted">Record details</p>
        <h1 className="mt-3 text-[15px] uppercase tracking-[0.28em] text-foreground">
          Welcome
        </h1>
        <p className="mt-6 text-[12px] leading-relaxed tracking-[0.06em] text-muted">
          Project01 is ready.<br />
          Your startup. Built step by step.<br />
          Before public launch, we're inviting you to get early access.<br />
          To continue, enter your name and email below.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          disabled={submitting}
          onChange={update("fullName")}
        />
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
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? "Processing" : "Continue"}
        </Button>
      </form>

      <div className="mt-6 min-h-[1.25rem] text-[12px] tracking-[0.06em]">
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
