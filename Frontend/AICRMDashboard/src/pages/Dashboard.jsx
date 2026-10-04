import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Wallet,
  Users,
  CalendarRange,
  Plus,
  CheckCircle2,
  Target,
  Layers,
  PieChart as PieIcon,
  CalendarClock,
  Trophy,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { format, isPast } from "date-fns";
import { StatCard } from "../components/common/StatCard";
import { AiInsightsCard } from "../components/ai/AiInsightsCard";
import {
  Card,
  SectionHeading,
  Badge,
  Tabs,
  Skeleton,
  Avatar,
} from "../components/ui";
import { analyticsApi, contactsApi, leadsApi, tasksApi } from "../lib/services";
import { currency, shortDate, timeOf } from "../lib/format";
import { STAGE_STYLES, PRIORITY_STYLES } from "../lib/constants";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

/* Chart colors — mirror the @theme tokens in index.css (Recharts needs raw values). */
const C = {
  brand: "#2f5e4a",
  brandDark: "#183328",
  brandSoft: "#adc5b5",
  lime: "#b5d420",
  pigeon: "#8994a6",
  grid: "#dcd1ba",
  tick: "#6b6656",
  hover: "#f3ecdd",
};
const SOURCE_COLORS = [C.brand, C.pigeon, C.lime, "#b8a77a", C.brandSoft, "#454e5d"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [range, setRange] = useState("monthly");

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(() => setData(false));
    contactsApi.list().then((res) => setContacts(res.contacts || [])).catch(() => {});
    leadsApi.list().then((res) => setLeads(res.leads || [])).catch(() => {});
    tasksApi.list().then((res) => setTasks(res.tasks || [])).catch(() => {});
  }, []);

  if (data === null) return <DashboardSkeleton />;
  const stats = data?.stats || {};
  const trend = data?.trend || [];

  // Month-over-month change in new leads, for the KPI chip.
  const prevLeads = trend.at(-2)?.leads ?? 0;
  const lastLeads = trend.at(-1)?.leads ?? 0;
  const leadTrend = prevLeads ? Math.round(((lastLeads - prevLeads) / prevLeads) * 100) : null;

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const rangeLabel = `${format(start, "dd MMM")} – ${format(today, "dd MMM yyyy")}`;
  const hour = today.getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Sales Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            Good {greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Here is how your pipeline is performing.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-md border border-line bg-surface px-3.5 text-sm text-ink-soft sm:flex">
            <CalendarRange className="h-4 w-4" />
            {rangeLabel}
          </div>
          <Link
            to="/tasks"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:bg-surface-muted"
          >
            <CheckCircle2 className="h-4 w-4" /> New Task
          </Link>
          <Link
            to="/leads"
            className="brand-gradient brand-gradient-hover inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Pipeline value"
          value={currency(stats.pipelineValue, { compact: true })}
          icon={Wallet}
          hint="open opportunities"
          accent
        />
        <StatCard
          label="Revenue won"
          value={currency(stats.revenueWon, { compact: true })}
          icon={Trophy}
          hint={`${currency(trend.at(-1)?.won ?? 0, { compact: true })} this month`}
        />
        <StatCard
          label="Total leads"
          value={stats.totalLeads ?? 0}
          icon={Users}
          trend={leadTrend}
          hint="vs last month"
        />
        <StatCard
          label="Win rate"
          value={`${stats.conversionRate ?? 0}%`}
          icon={Target}
          hint={`${stats.openTasks ?? 0} open follow-ups`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-8">
          <SectionHeading
            icon={BarChart3}
            title="Lead Acquisition"
            subtitle={range === "monthly" ? "New leads per month" : "New leads per year"}
            action={
              <Tabs
                value={range}
                onChange={setRange}
                tabs={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annually", label: "Annually" },
                ]}
              />
            }
          />
          <div className="mt-4">
            <EngagementChart
              trend={range === "monthly" ? trend : leadsByYear(leads)}
              xKey={range === "monthly" ? "month" : "year"}
            />
          </div>
        </Card>

        <Card className="flex flex-col p-6 lg:col-span-4">
          <SectionHeading title="Closed Revenue" subtitle="Won deals, last 6 months" to="/pipeline" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Total won</p>
          <p className="text-3xl font-semibold tracking-tight text-ink">{currency(stats.revenueWon)}</p>
          <div className="mt-auto">
            <BalanceChart trend={trend} />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-8">
          <SectionHeading title="Recent Lead Activity" subtitle="Latest updates across your leads" to="/leads" />
          <div className="mt-4">
            <ActivityTable leads={data?.recentLeads || []} />
          </div>
        </Card>

        <div className="lg:col-span-4">
          <UpcomingTasks tasks={tasks} />
        </div>

        <PipelineByStage pipeline={data?.pipeline || []} className="lg:col-span-4" />
        <div className="lg:col-span-4">
          <LeadsBySource leads={leads} />
        </div>
        <div className="lg:col-span-4">
          <TopDeals leads={leads} />
        </div>

        <div className="lg:col-span-8">
          <AiInsightsCard />
        </div>
        <div className="lg:col-span-4">
          <TopContactsCard contacts={contacts} />
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline by stage (funnel-style breakdown) ─────────────────────── */
function PipelineByStage({ pipeline, className }) {
  const maxValue = Math.max(...pipeline.map((s) => s.value), 1);
  const totalValue = pipeline.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card className={cn("p-6", className)}>
      <SectionHeading
        icon={Layers}
        title="Pipeline by Stage"
        subtitle="Deal value across each stage"
        to="/pipeline"
      />
      <div className="mt-5 space-y-4">
        {pipeline.map((s) => {
          const style = STAGE_STYLES[s.stage] || STAGE_STYLES.New;
          const pct = totalValue ? Math.round((s.value / totalValue) * 100) : 0;
          return (
            <div key={s.stage}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                  {s.stage}
                  <span className="text-ink-soft">· {s.count}</span>
                </span>
                <span className="font-semibold text-ink">
                  {currency(s.value, { compact: true })}
                  <span className="ml-1.5 text-xs font-normal text-ink-soft">{pct}%</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn("h-full rounded-full transition-all", style.bar)}
                  style={{ width: `${Math.max((s.value / maxValue) * 100, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
        {pipeline.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">No pipeline data yet.</p>
        )}
      </div>
    </Card>
  );
}

/* ── Leads by source (donut chart) ──────────────────────────────────── */
function LeadsBySource({ leads }) {
  // Group leads by their source field.
  const grouped = leads.reduce((acc, l) => {
    const key = l.source || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dataset = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  return (
    <Card className="h-full p-6">
      <SectionHeading icon={PieIcon} title="Leads by Source" subtitle="Where leads come from" />
      {dataset.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No leads yet.</p>
      ) : (
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataset}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={66}
                  paddingAngle={2}
                  stroke="none"
                >
                  {dataset.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" leads" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-xl font-bold text-ink">{leads.length}</span>
              <span className="text-[11px] text-ink-soft">leads</span>
            </div>
          </div>
          <ul className="flex-1 space-y-1.5">
            {dataset.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-medium text-ink">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/* ── Upcoming follow-ups (next due tasks) ───────────────────────────── */
function UpcomingTasks({ tasks }) {
  const upcoming = tasks
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 4);

  return (
    <Card className="flex h-full flex-col p-6">
      <SectionHeading
        icon={CalendarClock}
        title="Upcoming Follow-ups"
        subtitle="Don't let these slip"
        to="/tasks"
      />
      {upcoming.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-soft">No upcoming follow-ups.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map((t) => {
            const overdue = t.dueDate && isPast(new Date(t.dueDate));
            return (
              <li key={t._id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    overdue ? "bg-rose-50 text-rose-600" : "bg-pigeon-100 text-pigeon-600"
                  )}
                >
                  {overdue ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                  <p className={cn("text-xs", overdue ? "text-rose-600" : "text-ink-soft")}>
                    {t.dueDate ? shortDate(t.dueDate) : "No due date"}
                    {t.relatedLead?.name ? ` · ${t.relatedLead.name}` : ""}
                  </p>
                </div>
                <Badge className={PRIORITY_STYLES[t.priority]}>{t.priority}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ── Top open deals (highest-value active leads) ────────────────────── */
function TopDeals({ leads }) {
  const deals = [...leads]
    .filter((l) => l.status !== "Won" && l.status !== "Lost")
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  return (
    <Card className="flex h-full flex-col p-6">
      <SectionHeading icon={Trophy} title="Top Open Deals" subtitle="Biggest active opportunities" to="/leads" />
      {deals.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-soft">No open deals yet.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {deals.map((l, i) => {
            const style = STAGE_STYLES[l.status] || STAGE_STYLES.New;
            return (
              <li key={l._id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-soft">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ink-soft">
                    <Building2 className="h-3 w-3" /> {l.company || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">
                    {currency(l.value, { compact: true })}
                  </p>
                  <span className={cn("text-[11px] font-medium", style.badge, "bg-transparent px-0")}>
                    {l.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ── Engagement bar chart with a highlighted peak + floating bubble ──── */
function leadsByYear(leads) {
  const counts = {};
  for (const l of leads) {
    const y = new Date(l.createdAt).getFullYear();
    counts[y] = (counts[y] || 0) + 1;
  }
  return Object.keys(counts).sort().map((year) => ({ year, leads: counts[year] }));
}

function EngagementChart({ trend, xKey = "month" }) {
  const counts = trend.map((t) => t.leads);
  const max = Math.max(...counts, 1);
  const maxIndex = counts.indexOf(max);
  const prev = maxIndex > 0 ? counts[maxIndex - 1] : 0;
  const growth = prev > 0 ? Math.round(((max - prev) / prev) * 1000) / 10 : null;

  // Custom label: a "+x%" flag above the tallest bar only.
  const renderPeak = (props) => {
    const { x, y, width, index } = props;
    if (index !== maxIndex || growth === null) return null;
    const cx = x + width / 2;
    return (
      <g>
        <rect x={cx - 28} y={y - 30} width={56} height={22} rx={4} fill={C.brandDark} />
        <text x={cx} y={y - 15} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.lime}>
          +{growth}%
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={trend} barCategoryGap="30%" margin={{ top: 34 }}>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          axisLine={{ stroke: C.grid }}
          tickLine={false}
          tick={{ fill: C.tick, fontSize: 12 }}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: C.tick, fontSize: 12 }}
          width={30}
          allowDecimals={false}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
        />
        <Tooltip cursor={{ fill: C.hover }} content={<ChartTooltip unit=" leads" />} />
        <Bar dataKey="leads" radius={[4, 4, 0, 0]} maxBarSize={48} label={renderPeak}>
          {trend.map((t, i) => (
            <Cell key={i} fill={i === maxIndex ? C.lime : C.brand} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BalanceChart({ trend }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={trend} margin={{ top: 14, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.brand} stopOpacity={0.28} />
            <stop offset="100%" stopColor={C.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip content={<ChartTooltip prefix="$" />} />
        <Area type="monotone" dataKey="won" stroke={C.brand} strokeWidth={2} fill="url(#balance)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label, prefix = "", unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="text-sm font-semibold text-ink">
        {prefix}
        {Number(payload[0].value).toLocaleString()}
        {unit}
      </p>
    </div>
  );
}

/* ── Recent activity table (Payment History style) ──────────────────── */
function ActivityTable({ leads }) {
  if (!leads.length)
    return <p className="py-10 text-center text-sm text-ink-soft">No recent activity yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="hidden pb-3 font-medium sm:table-cell">Time</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const style = STAGE_STYLES[l.status] || STAGE_STYLES.New;
            return (
              <tr
                key={l.id}
                className="border-t border-line transition hover:bg-surface-muted/50"
              >
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={l.name} size="sm" />
                    <div>
                      <p className="font-medium text-ink">{l.name}</p>
                      <p className="text-xs text-ink-soft">{l.company || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-ink-soft">{shortDate(l.updatedAt)}</td>
                <td className="hidden py-3.5 text-ink-soft sm:table-cell">
                  {timeOf(l.updatedAt)}
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-sm text-ink">
                    <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                    {l.status}
                  </span>
                </td>
                <td className="py-3.5 text-right font-semibold text-ink">
                  {currency(l.value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Top contacts (avatar stack — the "Mandatory Payments" slot) ─────── */
function TopContactsCard({ contacts }) {
  const top = contacts.slice(0, 4);
  const overflow = Math.max(contacts.length - top.length, 0);

  return (
    <Card className="h-full p-6">
      <SectionHeading title="Top Contacts" subtitle="Your key relationships" to="/contacts" />
      {contacts.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No contacts yet.</p>
      ) : (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-3">
            {top.map((c) => (
              <Avatar
                key={c._id}
                name={c.name}
                src={c.avatar}
                size="md"
                className="ring-2 ring-surface"
              />
            ))}
            {overflow > 0 && (
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-surface">
                +{overflow}
              </div>
            )}
          </div>
          <Link
            to="/contacts"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-80" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="space-y-5 lg:col-span-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-5 lg:col-span-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
