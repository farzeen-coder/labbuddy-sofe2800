"use client";
// Lab dashboard: loads the lab by its code and shows three tabs.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Lab } from "@/lib/types";
import Checklist from "@/components/Checklist";
import Partners from "@/components/Partners";
import Deadlines from "@/components/Deadlines";

const TABS = ["Checklist", "Partners", "Deadlines"] as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      <main className="relative mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-md text-slate-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="rounded-lg bg-white/10 p-1.5 text-indigo-200 ring-1 ring-white/15"
      >
        <path
          d="M12 5h8M14 5v8.5L8 24a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 24 24l-6-10.5V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-semibold tracking-tight">LabBuddy</span>
    </Link>
  );
}

export default function LabPage() {
  const { code } = useParams<{ code: string }>();
  const [lab, setLab] = useState<Lab | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Checklist");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase
      .from("labs")
      .select("*")
      .eq("code", code.toUpperCase())
      .maybeSingle()
      .then(({ data }) => (data ? setLab(data) : setError("Lab not found. Check the code.")));
  }, [code]);

  async function copyCode() {
    if (!lab) return;
    try {
      await navigator.clipboard.writeText(lab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the code is still visible on screen.
    }
  }

  if (error)
    return (
      <Shell>
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-red-200">
          {error}
        </p>
        <Link href="/" className="mt-4 inline-block text-indigo-200 underline underline-offset-4 hover:text-white">
          Back home
        </Link>
      </Shell>
    );
  if (!lab)
    return (
      <Shell>
        <p className="py-12 text-center text-slate-300">Loading...</p>
      </Shell>
    );

  return (
    <Shell>
      <Brand />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{lab.name}</h1>
        <button
          onClick={copyCode}
          aria-label={`Copy lab code ${lab.code}`}
          className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-sm text-indigo-100 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <span className="text-slate-400">Code</span>
          <span className="tracking-widest">{lab.code}</span>
          <span className="text-xs text-slate-300">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-300">
        {lab.partner1} &amp; {lab.partner2}. Share the code with your partner so they can join.
      </p>

      <div role="tablist" className="mt-7 inline-flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
              tab === t ? "bg-white/15 text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Checklist" && <Checklist lab={lab} />}
        {tab === "Partners" && <Partners lab={lab} />}
        {tab === "Deadlines" && <Deadlines lab={lab} />}
      </div>
    </Shell>
  );
}
     
   
