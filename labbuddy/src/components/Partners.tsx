"use client";
// Partner Workspace (Person C): see each partner's progress, assign tasks, and auto-split the work.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Task } from "@/lib/types";
import { autoSplit } from "@/lib/autoSplit";

const card = "rounded-2xl border border-white/10 bg-white/[0.07] shadow-xl shadow-black/10 backdrop-blur";

export default function Partners({ lab }: { lab: Lab }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState(false);
  const people: [string, string] = [lab.partner1, lab.partner2];

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("lab_id", lab.id)
      .order("created_at");
    setLoading(false);
    if (error) return setError("Couldn't load tasks.");
    setTasks(data ?? []);
  }, [lab.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // refresh so your partner's changes show up
    return () => clearInterval(t);
  }, [load]);

  async function assign(id: string, assignee: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignee: assignee || null } : t)));
    const { error } = await supabase
      .from("tasks")
      .update({ assignee: assignee || null })
      .eq("id", id);
    if (error) setError("Couldn't assign the task.");
    load();
  }

  async function runAutoSplit() {
    const changes = autoSplit(tasks, people);
    if (changes.length === 0) {
      setMessage("Nothing to split: every open task already has someone.");
      return;
    }
    setSplitting(true);
    setError("");
    const results = await Promise.all(
      changes.map((c) => supabase.from("tasks").update({ assignee: c.assignee }).eq("id", c.id))
    );
    setSplitting(false);
    if (results.some((r) => r.error)) setError("Some tasks couldn't be assigned. Please try again.");
    else setMessage(`Split ${changes.length} task${changes.length === 1 ? "" : "s"} between ${people[0]} and ${people[1]}.`);
    load();
  }

  const unassigned = tasks.filter((t) => !t.assignee && !t.done).length;

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((p) => {
          const mine = tasks.filter((t) => t.assignee === p);
          const done = mine.filter((t) => t.done).length;
          const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
          return (
            <div key={p} className={`${card} p-5`}>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-sm font-semibold uppercase text-indigo-100 ring-1 ring-indigo-300/30"
                >
                  {p.trim().charAt(0)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">{p}</h2>
                  <p className="text-sm text-slate-300">
                    {done}/{mine.length} done ({pct}%)
                  </p>
                </div>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p} progress`}
              >
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Assign tasks</h2>
          <p className="text-sm text-slate-300">
            {unassigned} open task{unassigned === 1 ? "" : "s"} without an owner
          </p>
        </div>
        <button
          onClick={runAutoSplit}
          disabled={splitting || unassigned === 0}
          className="rounded-lg bg-indigo-400 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 disabled:opacity-40"
        >
          {splitting ? "Splitting..." : "Auto-split unassigned"}
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {!loading && tasks.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/15 px-4 py-5 text-center text-sm text-slate-400">
          No tasks yet. Add tasks in the Checklist tab first.
        </p>
      )}

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className={`${card} flex items-center gap-3 px-4 py-3`}>
            <span className={`flex-1 ${t.done ? "text-slate-500 line-through" : "text-slate-100"}`}>
              {t.title}
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300 no-underline">
                {t.section === "pre" ? "Pre-lab" : "Post-lab"}
              </span>
            </span>
            <select
              value={t.assignee ?? ""}
              onChange={(e) => assign(t.id, e.target.value)}
              aria-label={`Assign ${t.title}`}
              className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-sm text-white outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"
            >
              <option value="" className="text-slate-900">
                Unassigned
              </option>
              {people.map((p) => (
                <option key={p} value={p} className="text-slate-900">
                  {p}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

       
    
