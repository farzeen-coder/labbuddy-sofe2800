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
  "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30";

const label = "block font-mono text-xs uppercase tracking-wider text-slate-400";

const FEATURES = [
  { id: "01", title: "checklists", text: "Pre-lab and post-lab tasks with live progress." },
  { id: "02", title: "partner_split", text: "See who owns what and divide the work fairly." },
  { id: "03", title: "deadlines", text: "Every due date in one place, sorted by urgency." },
];

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
    <div className="min-h-screen bg-slate-950 [background-image:radial-gradient(rgb(51_65_85/0.55)_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="min-h-screen bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent">
        <main className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-sm text-indigo-300">
            <span className="text-slate-500">~/otu/</span>labbuddy
            <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-indigo-300" aria-hidden="true" />
          </p>

          <header className="mt-8 max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Ship your lab reports <span className="text-indigo-300">without the chaos.</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Pre-labs, partner tasks and deadlines, all in one shared dashboard. Built by students who were tired of
              chasing group chats.
            </p>
          </header>

          {error && (
            <p
              role="alert"
              className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 font-mono text-sm text-red-300"
            >
              error: {error}
            </p>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <form
              onSubmit={createLab}
              className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur"
            >
              <h2 className="font-mono text-sm font-medium text-indigo-300">$ new_lab</h2>
              <label className={label}>
                Lab name
                <input className={input + " font-sans normal-case tracking-normal"} value={name} onChange={(e) => setName(e.target.value)} placeholder="Circuits Lab 3" />
              </label>
              <label className={label}>
                Your name
                <input className={input + " font-sans normal-case tracking-normal"} value={p1} onChange={(e) => setP1(e.target.value)} />
              </label>
              <label className={label}>
                Partner&apos;s name
                <input className={input + " font-sans normal-case tracking-normal"} value={p2} onChange={(e) => setP2(e.target.value)} />
              </label>
              <button
                disabled={busy}
                className="w-full rounded-lg bg-indigo-500 py-2.5 font-medium text-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50"
              >
                {busy ? "Creating..." : "Create lab"}
              </button>
            </form>

            <form
              onSubmit={joinLab}
              className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur"
            >
              <h2 className="font-mono text-sm font-medium text-indigo-300">$ join_lab</h2>
              <p className="text-sm leading-relaxed text-slate-400">
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
              <button className="w-full rounded-lg border border-slate-600 bg-transparent py-2.5 font-medium text-slate-100 transition hover:border-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Join lab
              </button>
            </form>
          </div>

          <ul className="mt-14 grid gap-6 border-t border-slate-800 pt-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.id}>
                <p className="font-mono text-xs text-slate-500">
                  {f.id} <span className="text-indigo-300">{f.title}</span>
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.text}</p>
              </li>
            ))}
          </ul>

          <p className="mt-12 font-mono text-xs text-slate-600">
            // built by Clueless Commit · Ontario Tech University
          </p>
        </main>
      </div>
    </div>
  );
}

  
      
         
    
