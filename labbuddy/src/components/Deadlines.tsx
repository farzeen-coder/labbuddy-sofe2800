"use client";
// Deadline Tracker (Person A): add due dates and see Overdue / Due soon / On track badges.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Deadline } from "@/lib/types";
import { daysLeft, labelFor, statusFor, type DeadlineStatus } from "@/lib/deadlines";

const BADGE: Record<DeadlineStatus, string> = {
  overdue: "bg-red-500/15 text-red-200 ring-1 ring-red-400/30",
  soon: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30",
  ok: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30",
};

const EDGE: Record<DeadlineStatus, string> = {
  overdue: "border-l-red-400",
  soon: "border-l-amber-300",
  ok: "border-l-emerald-400",
};

const card = "rounded-2xl border border-white/10 bg-white/[0.07] shadow-xl shadow-black/10 backdrop-blur";

const field =
  "rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/15 focus:ring-2 focus:ring-indigo-300/30 [color-scheme:dark]";

const prettyDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function Deadlines({ lab }: { lab: Lab }) {
  const [items, setItems] = useState<Deadline[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .eq("lab_id", lab.id)
      .order("due_date");
    setLoading(false);
    if (error) return setError("Couldn't load deadlines.");
    setItems(data ?? []);
  }, [lab.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // refresh so your partner's changes show up
    return () => clearInterval(t);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return setError("Enter a title and a due date.");
    const { error } = await supabase
      .from("deadlines")
      .insert({ lab_id: lab.id, title: title.trim(), due_date: date });
    if (error) return setError("Couldn't add the deadline.");
    setTitle("");
    setDate("");
    setError("");
    load();
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((d) => d.id !== id));
    const { error } = await supabase.from("deadlines").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete the deadline.");
      load();
    }
  }

  const overdueCount = items.filter((d) => statusFor(daysLeft(d.due_date)) === "overdue").length;
  const soonCount = items.filter((d) => statusFor(daysLeft(d.due_date)) === "soon").length;

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <span className={`rounded-full px-3 py-1 ${BADGE.overdue}`}>{overdueCount} overdue</span>
          <span className={`rounded-full px-3 py-1 ${BADGE.soon}`}>{soonCount} due soon</span>
          <span className={`rounded-full px-3 py-1 ${BADGE.ok}`}>
            {items.length - overdueCount - soonCount} on track
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Deadline title"
          placeholder="Lab 3 report due"
          className={`${field} min-w-0 flex-1`}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Due date"
          className={field}
        />
        <button className="rounded-lg bg-indigo-400 px-5 py-2.5 font-medium text-slate-900 transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900">
          Add
        </button>
      </form>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/15 px-4 py-5 text-center text-sm text-slate-400">
          No deadlines yet. Add your pre-lab and report due dates above.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((d) => {
          const days = daysLeft(d.due_date);
          const status = statusFor(days);
          return (
            <li
              key={d.id}
              className={`${card} flex items-center gap-3 border-l-4 px-4 py-3 ${EDGE[status]}`}
            >
              <div className="flex-1">
                <p className="font-medium text-white">{d.title}</p>
                <p className="text-sm text-slate-400">{prettyDate(d.due_date)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[status]}`}>
                {labelFor(days)}
              </span>
              <button
                onClick={() => remove(d.id)}
                aria-label={`Delete ${d.title}`}
                className="rounded-md px-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:text-red-300"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


 
   
   
   
