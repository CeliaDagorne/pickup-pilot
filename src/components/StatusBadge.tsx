import type { FlightStatus } from "@/lib/types";

const STYLES: Record<FlightStatus, string> = {
  scheduled: "bg-sky-500/20 text-sky-300 ring-sky-400/30",
  boarding: "bg-amber-500/20 text-amber-300 ring-amber-400/30",
  departed: "bg-indigo-500/20 text-indigo-300 ring-indigo-400/30",
  in_air: "bg-indigo-500/20 text-indigo-300 ring-indigo-400/30",
  landed: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30",
  delayed: "bg-orange-500/20 text-orange-300 ring-orange-400/30",
  cancelled: "bg-red-500/20 text-red-300 ring-red-400/30",
  unknown: "bg-slate-500/20 text-slate-300 ring-slate-400/30",
};

export function StatusBadge({
  status,
  label,
}: {
  status: FlightStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}
