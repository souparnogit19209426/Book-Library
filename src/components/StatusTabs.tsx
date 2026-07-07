import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import type { BookStatus } from "@/lib/types";

const ACTIVE_CLASSES: Record<"all" | BookStatus, string> = {
  all: "bg-text-1 text-white border-text-1",
  reading: "bg-[#374151] text-white border-[#374151]",
  done: "bg-text-1 text-white border-text-1",
  paused: "bg-[#6b7280] text-white border-[#6b7280]",
  unread: "bg-surface-3 text-text-1 border-border-2",
};

export function StatusTabs({
  value,
  onChange,
}: {
  value: "all" | BookStatus;
  onChange: (v: "all" | BookStatus) => void;
}) {
  const options: ("all" | BookStatus)[] = ["all", ...STATUSES];

  return (
    <div className="mb-6 flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        const label = opt === "all" ? "All" : STATUS_LABELS[opt];
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? ACTIVE_CLASSES[opt]
                : "border-border bg-surface text-text-2 hover:border-border-2 hover:text-text-1"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
