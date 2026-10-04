import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Contact2,
  KanbanSquare,
  StickyNote,
  CalendarCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

/* Primary navigation — persistent evergreen sidebar, grouped like an enterprise CRM. */
const SECTIONS = [
  {
    title: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutGrid, end: true }],
  },
  {
    title: "Sales",
    items: [
      { to: "/leads", label: "Leads", icon: Users },
      { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { to: "/contacts", label: "Contacts", icon: Contact2 },
    ],
  },
  {
    title: "Workspace",
    items: [
      { to: "/tasks", label: "Follow-ups", icon: CalendarCheck },
      { to: "/notes", label: "Notes", icon: StickyNote },
    ],
  },
];

const linkClass = ({ isActive }) =>
  cn(
    "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white/10 text-white before:absolute before:inset-y-1.5 before:-left-3 before:w-[3px] before:rounded-r before:bg-lime-400"
      : "text-brand-100/75 hover:bg-white/5 hover:text-white"
  );

export function Sidebar({ onNavigate }) {
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col bg-brand-800 text-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400 font-mono text-sm font-medium text-brand-900">
          T
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">TTP CRM</p>
          <p className="text-[11px] text-brand-200/70">Sales Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-pigeon-300">
              {s.title}
            </p>
            <div className="space-y-0.5">
              {s.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-white/10 p-3">
        <NavLink to="/settings" onClick={onNavigate} className={linkClass}>
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-brand-100/75 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}
