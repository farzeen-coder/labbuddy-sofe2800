"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Task } from "@/lib/types";
import { progress } from "@/lib/progress";

type Section = "pre" | "post";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "pre", label: "Pre-lab" },
  { key: "post", label: "Post-lab" },
];

function SectionIcon({ kind }: { kind: Section }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-indigo-200"
    >
      {kind === "pre" ? (
        <path d="M9 3h6M10 3v6.5L5 19a1.5 1.5 0 0 0 1.4 2h11.2A1.5 1.5 0 0 0 19 19l-5-9.5V3" />
      ) : (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </>
      )}
    </svg>
  );
}

const card = "rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/10 backdrop-blur";

export default function Checklist({ lab }: { lab: Lab }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<Section>("pre");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Task title can't be empty.");
    const { error } = await supabase
      .from("tasks")
      .insert({ lab_id: lab.id, title: title.trim(), section });
    if (error) return setError("Couldn't add the task.");
    setTitle("");
    setError("");
    load();
  }

  async function toggle(task: Task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    const { error } = await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
    if (error) {
      setError("Couldn't update the task.");
      load();
    }
  }

  async function remove(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setError("Couldn't delete the task.");
      load();
    }
  }

  const overall = progress(tasks);
  const allDone = overall.total > 0 && overall.percent === 100;

  return (
    <div className="space-y-6">
      <div className={card}>
        <div className="flex items-baseline justify-between text-sm font-medium text-slate-200">
          <span>{allDone ? "All done. Nice work." : "Overall progress"}</span>
          <span className="text-slate-300">
            {overall.done}/{overall.total} done ({overall.percent}%)
          </span>
        </div>
        <div
          className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={overall.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="New task"
          placeholder="Add a task, e.g. Read the lab manual"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/15 focus:ring-2 focus:ring-indigo-300/30"
        />
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as Section)}
          aria-label="Section"
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-white outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"
        >
          <option value="pre" className="text-slate-900">
            Pre-lab
          </option>
          <option value="post" className="text-slate-900">
            Post-lab
          </option>
        </select>
        <button className="rounded-lg bg-indigo-400 px-5 py-2.5 font-medium text-slate-900 transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900">
          Add
        </button>
      </form>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}

      {!loading &&
        SECTIONS.map(({ key, label }) => {
          const items = tasks.filter((t) => t.section === key);
          const p = progress(items);
          return (
            <section key={key} className={card}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <SectionIcon kind={key} />
                  {label}
                </h2>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {p.done}/{p.total} done
                </span>
              </div>
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-white/15 px-4 py-5 text-center text-sm text-slate-400">
                  No {label.toLowerCase()} tasks yet. Add your first one above.
                </p>
              )}
              <ul className="space-y-1">
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.06]"
                  >
                    <input
                      type="checkbox"
                      id={`task-${t.id}`}
                      checked={t.done}
                      onChange={() => toggle(t)}
                      className="h-5 w-5 cursor-pointer accent-indigo-400"
                    />
                    <label
                      htmlFor={`task-${t.id}`}
                      className={`flex-1 cursor-pointer transition ${
                        t.done ? "text-slate-500 line-through" : "text-slate-100"
                      }`}
                    >
                      {t.title}
                    </label>
                    {t.assignee && (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                        {t.assignee}
                      </span>
                    )}
                    <button
                      onClick={() => remove(t)}
                      aria-label={`Delete ${t.title}`}
                      className="rounded-md px-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:text-red-300"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
  
      
 
         
  
