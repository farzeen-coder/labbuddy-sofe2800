"use client";
// Home page: start a new lab or join one with a 6-character code.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// No 0/O or 1/I so codes are easy to read out loud to your partner.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const input =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/15 focus:ring-2 focus:ring-indigo-300/30";

const label = "block text-sm font-medium text-slate-200";

const card =
  "space-y-4 rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-xl shadow-black/10 backdrop-blur";

function Check({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
        done ? "border-emerald-400 bg-emerald-400/90 text-slate-900" : "border-slate-500"
      }`}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5l2.2 2.2L9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function Preview() {
  return (
    <div aria-hidden="true" className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-violet-500/20 to-transparent blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-white">Circuits Lab 3</p>
            <p className="mt-0.5 text-xs text-slate-400">2 partners · 3 tasks</p>
          </div>
          <span className="rounded-md bg-indigo-400/15 px-2 py-1 font-mono text-xs text-indigo-200">K7M2QX</span>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall progress</span>
            <span>2/3 done (67%)</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
          </div>
        </div>

        <ul className="mt-5 space-y-2.5 text-sm">
          <li className="flex items-center gap-3 text-slate-400">
            <Check done />
            <span className="flex-1 line-through">Read the lab manual</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">Partner A</span>
          </li>
          <li className="flex items-center gap-3 text-slate-400">
            <Check done />
            <span className="flex-1 line-through">Build the circuit</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">Partner B</span>
          </li>
          <li className="flex items-center gap-3 text-slate-100">
            <Check done={false} />
            <span className="flex-1">Record measurements</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">Partner A</span>
          </li>
        </ul>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Lab report due in 3 days
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createLab(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !p1.trim() || !p2.trim())
      return setError("Enter a lab name and both partner names.");
    setBusy(true);
    const code = makeCode();
    const { error } = await supabase
      .from("labs")
      .insert({ code, name: name.trim(), partner1: p1.trim(), partner2: p2.trim() });
    setBusy(false);
    if (error) return setError("Couldn't create the lab. Please try again.");
    router.push(`/lab/${code}`);
  }

  async function joinLab(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return setError("Enter a lab code.");
    const { data } = await supabase.from("labs").select("code").eq("code", code).maybeSingle();
    if (!data) return setError("No lab found with that code.");
    router.push(`/lab/${code}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

      <main className="relative mx-auto max-w-5xl px-6 py-12">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg
              width="32"
              height="32"
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
            <span className="text-lg font-semibold tracking-tight text-white">LabBuddy</span>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
            Ontario Tech · Project Sprint
          </span>
        </nav>

        <section className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <header>
            <p className="font-mono text-sm text-indigo-200">// for lab partners</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Lab reports,
              <span className="bg-gradient-to-r from-indigo-200 to-violet-300 bg-clip-text text-transparent"> without the chaos.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-300">
              Pre-labs, partner tasks and deadlines in one shared dashboard. Built by students who were tired of
              chasing group chats.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live shared checklist
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Fair task split
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Deadline tracking
              </li>
            </ul>
          </header>

          <Preview />
        </section>

        {error && (
          <p
            role="alert"
            className="mt-12 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        <div className={`${error ? "mt-6" : "mt-16"} grid gap-6 md:grid-cols-2`}>
          <form onSubmit={createLab} className={card}>
            <h2 className="text-lg font-semibold text-white">Start a new lab</h2>
            <label className={label}>
              Lab name
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Circuits Lab 3" />
            </label>
            <label className={label}>
              Your name
              <input className={input} value={p1} onChange={(e) => setP1(e.target.value)} />
            </label>
            <label className={label}>
              Partner&apos;s name
              <input className={input} value={p2} onChange={(e) => setP2(e.target.value)} />
            </label>
            <button
              disabled={busy}
              className="w-full rounded-lg bg-indigo-400 py-2.5 font-medium text-slate-900 transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create lab"}
            </button>
          </form>

          <form onSubmit={joinLab} className={card}>
            <h2 className="text-lg font-semibold text-white">Join with a code</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Ask your partner for their 6-character lab code to open the same dashboard.
            </p>
            <label className={label}>
              Lab code
              <input
                className={input + " font-mono text-lg uppercase tracking-[0.3em]"}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6}
                placeholder="ABC123"
              />
            </label>
            <button className="w-full rounded-lg border border-white/25 bg-white/5 py-2.5 font-medium text-white transition hover:border-indigo-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900">
              Join lab
            </button>
          </form>
        </div>

        <p className="mt-12 text-center font-mono text-xs text-slate-400">
          Built by Clueless Commit · Ontario Tech University
        </p>
      </main>
    </div>
  );
}



      

  
      
         
    
