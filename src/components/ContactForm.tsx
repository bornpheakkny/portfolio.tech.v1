"use client";

import { useState } from "react";
import { contactSchema } from "@/shared";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setState("error");
      setError(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join(". "));
      return;
    }
    setState("sending");
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "The message couldn't be sent.");
      form.reset();
      setState("sent");
    } catch (err) {
      setState("error");
      setError((err as Error).message + " Try again in a minute, or email me directly.");
    }
  }

  const input =
    "w-full rounded-xl border border-orbit bg-panel/70 px-4 py-3 text-star placeholder:text-muted/70 outline-none transition focus:border-brass";

  if (state === "sent") {
    return (
      <p className="rounded-2xl border border-brass/40 bg-panel/70 p-6 text-star" role="status">
        Message sent. I&apos;ll reply to your email soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Your name</span>
          <input name="name" required autoComplete="name" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Your email</span>
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Message</span>
        <textarea name="message" required rows={5} className={input} />
      </label>
      {state === "error" && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-full bg-brass px-6 py-3 font-medium text-void transition hover:bg-[#f0c97c] disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
