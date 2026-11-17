"use client";

import { useState } from "react";
import { contactSchema } from "@/shared";
import button from "@/components/ui/button.module.css";
import styles from "./ContactForm.module.css";

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


  if (state === "sent") {
    return (
      <p className={styles.sent} role="status">
        Message sent. I&apos;ll reply to your email soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Your name</span>
          <input name="name" required autoComplete="name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Your email</span>
          <input name="email" type="email" required autoComplete="email" className={styles.input} />
        </label>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea name="message" required rows={5} className={styles.input} />
      </label>
      {state === "error" && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className={button.primary}
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
