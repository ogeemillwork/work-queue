"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

const inputCls = "w-full rounded-lg border border-line bg-white px-2.5 py-[9px]";

export default function LoginScreen({ supabase }: { supabase: SupabaseClient }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else if (!data.session) setNotice("Check your email to confirm your account, then log in.");
        // With email confirmation off, signUp returns a session and AuthGate
        // moves to the awaiting-approval screen on its own.
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-[420px] rounded-[14px] bg-white p-6 shadow-card">
        <h1 className="text-center text-[22px] font-bold tracking-wide">OGEE Millwork PMA</h1>
        <p className="mt-[3px] text-center text-[13px] text-muted">
          {mode === "login" ? "Log in to the shop board" : "Sign up — an admin approves new accounts"}
        </p>

        <label className="mb-3 mt-6 grid gap-[5px] text-[13px] [font-weight:650]">
          Email
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="mb-3 grid gap-[5px] text-[13px] [font-weight:650]">
          Password
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>

        {error && <p className="mb-3 text-[13px] text-danger">{error}</p>}
        {notice && <p className="mb-3 text-[13px] text-accent">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg border border-accent bg-accent px-[11px] py-2 text-white disabled:opacity-60"
        >
          {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          className="mt-4 w-full border-0 bg-transparent text-center text-[13px] text-muted underline"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setNotice("");
          }}
        >
          {mode === "login" ? "New here? Sign up" : "Have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
