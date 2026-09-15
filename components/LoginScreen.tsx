"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

const inputCls = "w-full rounded-[10px] border border-line bg-[#0f151c] px-2.5 py-[9px] text-ink";

export default function LoginScreen({ supabase }: { supabase: SupabaseClient }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setError("");
    setNotice("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    // On success the browser navigates away to Google; only errors come back.
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

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
      <form onSubmit={submit} className="w-full max-w-[430px] rounded-[18px] border border-line bg-[#151c24] p-[22px] shadow-dialog">
        <h1 className="text-center text-[22px] font-bold tracking-[.08em]">OGEE MILLWORK</h1>
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

        {error && <p className="mb-3 text-[13px] text-[#ff9d9d]">{error}</p>}
        {notice && <p className="mb-3 text-[13px] text-[#8ee4a6]">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-[10px] border border-warn bg-accent px-[11px] py-2 font-bold text-[#17130c] disabled:opacity-60"
        >
          {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <div className="my-4 flex items-center gap-3 text-[12px] text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
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
