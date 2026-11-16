// Progress maths for the Checklist tab, kept separate from the UI so it is easy to test and explain.
import type { Task } from "@/lib/types";

export type Progress = { done: number; total: number; percent: number };

/** How many tasks are ticked off, out of how many, as a whole-number percentage. */
export function progress(tasks: Task[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
