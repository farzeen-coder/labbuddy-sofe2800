"use client";
// Percent Error calculator: compare a measured value to the accepted value.
// Everything runs in the browser, so nothing here touches the database.
import { useState } from "react";

type Entry = {
  id: number;
  label: string;
  measured: number;
  accepted: number;
  unit: string;
  percent: number;
};

const card = "rounded-2xl border border-white/10 bg-white/[0.07] shadow-xl shadow-black/10 backdrop-blur";

const field =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-white outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/15 focus:ring-2 focus:ring-indigo-300/30";

const labelCls = "block text-sm font-medium text-slate-200";

// Returns a finite number, or null when the text is empty or not a number.
function parse(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function quality(percent: number) {
  if (percent <= 5)
    return { text: "Close agreement", cls: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30" };
  if (percent <= 10)
    return { text: "Moderate difference", cls: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30" };
  return { text: "Large difference", cls: "bg-red-500/15 text-red-200 ring-1 ring-red-400/30" };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Number(n.toPrecision(6))));

export default function PercentError() {
  const [measured, setMeasured] = useState("");
  const [accepted, setAccepted] = useState("");
  const [unit, setUnit] = useState("");
  const [label, setLabel] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);

  const m = parse(measured);
  const a = parse(accepted);
  const touched = measured.trim() !== "" || accepted.trim() !== "";
  const invalidM = measured.trim() !== "" && m === null;
  const invalidA = accepted.trim() !== "" && a === null;
  const zeroAccepted = a === 0;

  const ready = m !== null && a !== null && a !== 0;
  const percent = ready ? (Math.abs(m - a) / Math.abs(a)) * 100 : null;
  const diff = ready ? m - a : null;
  const u = unit.trim();

  function save() {
    if (m === null || a === null || a === 0 || percent === null) return;
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          label: label.trim() || `Trial ${prev.length + 1}`,
          measured: m,
          accepted: a,
          unit: u,
          percent,
        },
        ...prev,
      ].slice(0, 8)
    );
    setLabel("");
  }

  function clearAll() {
    setMeasured("");
    setAccepted("");
    setUnit("");
    setLabel("");
  }

  const q = percent !== null ? quality(percent) : null;
  const avg = history.length ? history.reduce((s, h) => s + h.percent, 0) / history.length : null;

  return (
    <div className="space-y-6">
      <div className={`${card} p-5`}>
        <h2 className="text-lg font-semibold text-white">Percent error</h2>
        <p className="mt-1 text-sm text-slate-300">
          How far is your measured value from the accepted value?
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Measured value
            <input
              className={field}
              inputMode="decimal"
              value={measured}
              onChange={(e) => setMeasured(e.target.value)}
              placeholder="e.g. 9.62"
              aria-invalid={invalidM}
            />
          </label>
          <label className={labelCls}>
            Accepted value
            <input
              className={field}
              inputMode="decimal"
              value={accepted}
              onChange={(e) => setAccepted(e.target.value)}
              placeholder="e.g. 9.81"
              aria-invalid={invalidA || zeroAccepted}
            />
          </label>
          <label className={labelCls}>
            Unit <span className="font-normal text-slate-400">(optional)</span>
            <input className={field} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. m/s²" />
          </label>
          <label className={labelCls}>
            Label <span className="font-normal text-slate-400">(optional)</span>
            <input className={field} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Trial 1" />
          </label>
        </div>

        {(invalidM || invalidA) && (
          <p role="alert" className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
            Enter numbers only, like 9.81 or 3e-4.
          </p>
        )}
        {zeroAccepted && !invalidA && (
          <p role="alert" className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
            The accepted value can&apos;t be zero, because percent error divides by it.
          </p>
        )}

        <div
          className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-5"
          aria-live="polite"
        >
          {m !== null && a !== null && percent !== null && q ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Percent error</p>
                  <p className="mt-0.5 text-4xl font-semibold tracking-tight text-white">{percent.toFixed(2)}%</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${q.cls}`}>{q.text}</span>
              </div>
              <p className="mt-4 font-mono text-sm leading-relaxed text-slate-300">
                |{fmt(m)} − {fmt(a)}| ÷ |{fmt(a)}| × 100 = {percent.toFixed(2)}%
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Your value was {diff !== null && diff > 0 ? "above" : diff !== null && diff < 0 ? "below" : "equal to"} the
                accepted value
                {diff !== null && diff !== 0 ? ` by ${fmt(Math.abs(diff))}${u ? " " + u : ""}` : ""}.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              {touched
                ? "Enter both values to see the result."
                : "Enter a measured and an accepted value to see the result."}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={save}
            disabled={!ready}
            className="rounded-lg bg-indigo-400 px-5 py-2.5 font-medium text-slate-900 transition hover:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 disabled:opacity-40"
          >
            Save to history
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Clear
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className={`${card} p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">History</h2>
            <div className="flex items-center gap-3">
              {avg !== null && history.length > 1 && (
                <span className="text-sm text-slate-300">Average: {avg.toFixed(2)}%</span>
              )}
              <button
                onClick={() => setHistory([])}
                className="text-sm text-slate-400 underline underline-offset-4 transition hover:text-white"
              >
                Clear history
              </button>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {history.map((h) => {
              const hq = quality(h.percent);
              return (
                <li key={h.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-white/[0.05] px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-white">{h.label}</span>
                    <span className="block text-sm text-slate-400">
                      {fmt(h.measured)} vs {fmt(h.accepted)}
                      {h.unit ? ` ${h.unit}` : ""}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${hq.cls}`}>
                    {h.percent.toFixed(2)}%
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-slate-500">History is kept on this page only and clears when you refresh.</p>
        </div>
      )}
    </div>
  );
}
