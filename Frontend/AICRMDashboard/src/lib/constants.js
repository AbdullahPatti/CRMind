/* Shared domain constants kept in one place so UI + filters stay in sync
   with the backend enums. */

export const LEAD_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const PIPELINE_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

export const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

/** Tailwind class tokens for each lead stage (badge + kanban accents).
    Pigeon = early, evergreen = working, khaki = negotiating, lime = won. */
export const STAGE_STYLES = {
  New: { dot: "bg-pigeon-400", badge: "bg-pigeon-100 text-pigeon-700", bar: "bg-pigeon-400" },
  Qualified: { dot: "bg-brand-500", badge: "bg-brand-50 text-brand-700", bar: "bg-brand-500" },
  Proposal: { dot: "bg-amber-600", badge: "bg-amber-50 text-amber-800", bar: "bg-amber-600" },
  Won: { dot: "bg-lime-500", badge: "bg-lime-100 text-lime-700", bar: "bg-lime-500" },
  Lost: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700", bar: "bg-rose-400" },
};

export const PRIORITY_STYLES = {
  Low: "bg-pigeon-100 text-pigeon-700",
  Medium: "bg-amber-50 text-amber-800",
  High: "bg-rose-50 text-rose-700",
};

export const TASK_STATUS_STYLES = {
  Pending: "bg-pigeon-100 text-pigeon-700",
  "In Progress": "bg-brand-50 text-brand-700",
  Completed: "bg-lime-100 text-lime-700",
};
