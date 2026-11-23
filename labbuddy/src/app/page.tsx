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
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const FEATURES = [
  { icon: "✅", label: "Shared checklists" },
  { icon: "🤝", label: "Fair task split" },
  { icon: "⏰", label: "Deadline tracker" },
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <main className="mx-auto max-w-3xl px-4 py-14">
        <header className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-indigo-700">
            <span aria-hidden="true">🧪 </span>LabBuddy
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-slate-600">
            Pre-labs, partner tasks and deadlines, all in one dashboard.
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {FEATURES.map((f) => (
              <li
                key={f.label}
                className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
              >
                <span aria-hidden="true">{f.icon} </span>
                {f.label}
              </li>
            ))}
          </ul>
        </header>

        {error && (
          <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-2 text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <form
            onSubmit={createLab}
            className="space-y-3 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-800">Start a new lab</h2>
            <label className="block text-sm font-medium text-slate-700">
              Lab name
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Circuits Lab 3" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Your name
              <input className={input} value={p1} onChange={(e) => setP1(e.target.value)} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Partner&apos;s name
              <input className={input} value={p2} onChange={(e) => setP2(e.target.value)} />
            </label>
            <button
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy ? "Creating..." : "Create lab"}
            </button>
          </form>

          <form
            onSubmit={joinLab}
            className="space-y-3 rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-800">Join with a code</h2>
            <p className="text-sm text-slate-500">
              Ask your partner for their 6-character lab code and jump straight into the same dashboard.
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Lab code
              <input
                className={input + " text-center font-mono text-lg uppercase tracking-[0.3em]"}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6}
                placeholder="ABC123"
              />
            </label>
            <button className="w-full rounded-xl border border-indigo-600 bg-white py-2.5 font-medium text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
              Join lab
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Built by Clueless Commit at Ontario Tech University
        </p>
      </main>
    </div>
  );
}
