export function ProgressSection({
  done,
  reading,
  total,
  scopeLabel,
}: {
  done: number;
  reading: number;
  total: number;
  /** e.g. "in this path" — appended to the sub-labels to clarify scope. */
  scopeLabel?: string;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const suffix = scopeLabel ? ` ${scopeLabel}` : "";

  return (
    <div className="mb-7 rounded-2xl border border-border bg-surface px-6 py-5">
      <div className="flex flex-wrap items-center gap-8">
        <div className="min-w-[100px] flex-1">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-4">
            Completed
          </div>
          <div className="text-[26px] font-semibold leading-none text-text-1">{done}</div>
          <div className="mt-0.5 text-xs text-text-3">books read{suffix}</div>
        </div>
        <div className="min-w-[100px] flex-1">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-4">
            In Progress
          </div>
          <div className="text-[26px] font-semibold leading-none text-text-1">{reading}</div>
          <div className="mt-0.5 text-xs text-text-3">currently reading</div>
        </div>
        <div className="min-w-[100px] flex-[3]">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-4">
            Reading Progress
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-[26px] font-semibold leading-none text-text-1">{pct}%</div>
            <div className="text-[13px] text-text-3">of {total} books{suffix}</div>
          </div>
          <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-text-1 transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
