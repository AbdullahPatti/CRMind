import { Search, Bell, Menu, ChevronDown, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "../ui";
import { useAuth } from "../../context/AuthContext";

const TITLES = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/contacts": "Contacts",
  "/tasks": "Follow-ups",
  "/notes": "Notes",
  "/settings": "Settings",
};

/* Top bar: breadcrumb, global search (filters Leads), follow-ups, profile. */
export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q").toString().trim();
    navigate(`/leads?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-soft hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden text-sm sm:block">
        <span className="text-ink-soft">TTP CRM</span>
        <span className="mx-2 text-pigeon-300">/</span>
        <span className="font-semibold text-ink">{TITLES[pathname] || "Workspace"}</span>
      </nav>

      <form onSubmit={onSearch} className="relative ml-auto w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          name="q"
          placeholder="Search leads, companies…"
          className="h-9 w-full rounded-md border border-line bg-surface-muted pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </form>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/tasks")}
          className="relative rounded-md border border-line p-2 text-ink-soft transition hover:bg-surface-muted hover:text-ink"
          aria-label="Follow-ups"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-lime-500 ring-2 ring-surface" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-surface-muted">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-medium text-ink">{user?.name}</span>
                <span className="block text-[11px] text-ink-soft">{user?.company || "Sales"}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-soft" />
            </button>
          }
        >
          <DropdownLabel>{user?.email}</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate("/settings")}>
            <User className="h-4 w-4" /> Profile & settings
          </DropdownItem>
          <DropdownItem danger onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
