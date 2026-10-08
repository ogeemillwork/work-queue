"use client";

import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { Profile } from "@/lib/types";
import Board from "./Board";
import LoginScreen from "./LoginScreen";

export default function AuthGate({ jobId }: { jobId?: string } = {}) {
  const supabase = getSupabaseBrowser();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(undefined);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile((data as Profile) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  // No Supabase configured: original local-only behavior, no auth.
  if (!supabase) return <Board auth={null} jobId={jobId} />;

  if (session === undefined) return null;
  if (!session) return <LoginScreen supabase={supabase} />;
  if (profile === undefined) return null;

  const signOut = () => {
    supabase.auth.signOut().catch(console.error);
  };

  if (!profile?.approved) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[430px] rounded-[18px] border border-line bg-[#151c24] p-[22px] text-center shadow-dialog">
          <h1 className="text-[22px] font-bold tracking-[.08em]">OGEE MILLWORK</h1>
          <p className="mt-4 text-[15px]">Your account is awaiting approval.</p>
          <p className="mt-2 text-[13px] text-muted">
            An admin needs to approve <span className="font-semibold">{session.user.email}</span> before
            you can see the board.
          </p>
          <button className="mt-6 rounded-[10px] border border-line bg-panel2 px-[11px] py-2 font-bold" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Board
      jobId={jobId}
      auth={{
        token: session.access_token,
        userId: session.user.id,
        email: profile.email || session.user.email || "",
        isAdmin: profile.is_admin,
        signOut,
      }}
    />
  );
}
