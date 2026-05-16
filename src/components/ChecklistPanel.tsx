"use client";

import type { ChecklistItem } from "@/lib/types";
import { Check, ListChecks } from "lucide-react";
import { useState } from "react";

const TIMING_LABELS: Record<ChecklistItem["timing"], string> = {
  "24h": "24 hours before",
  "3h": "3 hours before",
  "1h": "1 hour before",
  "30m": "30 minutes before",
};

export function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.timing]) acc[item.timing] = [];
      acc[item.timing].push(item);
      return acc;
    },
    {} as Record<ChecklistItem["timing"], ChecklistItem[]>,
  );

  const order: ChecklistItem["timing"][] = ["24h", "3h", "1h", "30m"];
  const done = checked.size;
  const total = items.length;

  return (
    <section className="glass-card p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sky-300">
          <ListChecks className="h-5 w-5" />
          <h3 className="font-semibold text-white">Pre-departure checklist</h3>
        </div>
        <span className="text-sm text-slate-400">
          {done}/{total} checked
        </span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-300"
          style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
        />
      </div>

      <div className="space-y-6">
        {order.map((timing) => {
          const group = grouped[timing];
          if (!group?.length) return null;
          return (
            <div key={timing}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-400/80">
                {TIMING_LABELS[timing]}
              </h4>
              <ul className="space-y-2">
                {group.map((item) => {
                  const isChecked = checked.has(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          isChecked
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-white/10 bg-white/5 hover:border-sky-500/30 hover:bg-white/8"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            isChecked
                              ? "border-emerald-400 bg-emerald-500 text-white"
                              : "border-slate-500 bg-transparent"
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block font-medium ${
                              isChecked ? "text-slate-400 line-through" : "text-white"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-sm text-slate-400">
                            {item.hint}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
