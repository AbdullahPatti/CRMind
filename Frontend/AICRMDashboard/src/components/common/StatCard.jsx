import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "../ui";
import { cn } from "../../lib/utils";

/**
 * KPI tile: uppercase label + icon, large figure, optional trend chip and footnote.
 * `accent` gives the tile a lime top rule to flag the headline metric.
 */
export function StatCard({ label, value, icon: Icon, trend, hint, accent = false }) {
  const positive = trend == null || trend >= 0;
  return (
    <Card className={cn("relative overflow-hidden p-5", accent && "border-t-[3px] border-t-lime-500")}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight text-ink">{value}</p>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold",
              positive ? "bg-lime-100 text-lime-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        {hint && <span className="text-ink-soft">{hint}</span>}
      </div>
    </Card>
  );
}
