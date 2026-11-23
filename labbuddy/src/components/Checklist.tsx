"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Task } from "@/lib/types";
import { progress } from "@/lib/progress";

type Section = "pre" | "post";

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: "pre", label: "Pre-lab", icon: "🧪" },
  { key: "post", label: "Post-lab", icon: "📝" },
];

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
      <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        <div className="flex items-baseline justify-between text-sm font-medium text-slate-700">
          <span>{allDone ? "All done! 🎉" : "Overall progress"}</span>
          <span>
            {overall.done}/{overall.total} done ({overall.percent}%)
          </span>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={overall.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-2 text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="New task"
          placeholder="Add a task, e.g. Read the lab manual"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as Section)}
          aria-label="Section"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="pre">Pre-lab</option>
          <option value="post">Post-lab</option>
        </select>
        <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">
          Add
        </button>
      </form>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {!loading &&
        SECTIONS.map(({ key, label, icon }) => {
          const items = tasks.filter((t) => t.section === key);
          const p = progress(items);
          return (
            <section
              key={key}
              className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  <span className="mr-2" aria-hidden="true">
                    {icon}
                  </span>
                  {label}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {p.done}/{p.total} done
                </span>
              </div>
              {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
                  No {label.toLowerCase()} tasks yet. Add your first one above ✨
                </p>
              )}
              <ul className="space-y-1.5">
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-indigo-50/60"
                  >
                    <input
                      type="checkbox"
                      id={`task-${t.id}`}
                      checked={t.done}
                      onChange={() => toggle(t)}
                      className="h-5 w-5 cursor-pointer accent-indigo-600"
                    />
                    <label
                      htmlFor={`task-${t.id}`}
                      className={`flex-1 cursor-pointer transition ${
                        t.done ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {t.title}
                    </label>
                    {t.assignee && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {t.assignee}
                      </span>
                    )}
                    <button
                      onClick={() => remove(t)}
                      aria-label={`Delete ${t.title}`}
                      className="rounded-md px-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600 focus-visible:text-red-600 group-hover:text-slate-400"
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
