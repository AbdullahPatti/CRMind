import { Lead, LEAD_STATUSES } from "../models/Lead.js";
import { Contact } from "../models/Contact.js";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Pure so the AI insights endpoint can reuse it.
export const buildOverview = (leads, totalContacts, openTasks) => {
    const byStage = Object.fromEntries(LEAD_STATUSES.map((s) => [s, { count: 0, value: 0 }]));
    let pipelineValue = 0;
    for (const l of leads) {
        byStage[l.status].count += 1;
        byStage[l.status].value += l.value || 0;
        pipelineValue += l.value || 0;
    }

    const won = byStage.Won.count;
    const closed = won + byStage.Lost.count;

    const now = new Date();
    const trend = [];
    const idx = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        idx[`${d.getFullYear()}-${d.getMonth()}`] = trend.length;
        trend.push({ month: MONTHS[d.getMonth()], leads: 0, won: 0 });
    }
    for (const l of leads) {
        const d = new Date(l.createdAt);
        const i = idx[`${d.getFullYear()}-${d.getMonth()}`];
        if (i === undefined) continue;
        trend[i].leads += 1;
        if (l.status === "Won") trend[i].won += l.value || 0;
    }

    const recentLeads = [...leads]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6)
        .map((l) => ({ id: l._id, name: l.name, company: l.company, status: l.status, value: l.value, updatedAt: l.updatedAt }));

    return {
        stats: {
            revenueWon: byStage.Won.value,
            pipelineValue,
            totalLeads: leads.length,
            totalContacts,
            openTasks,
            conversionRate: closed ? Math.round((won / closed) * 100) : 0,
        },
        pipeline: LEAD_STATUSES.map((s) => ({ stage: s, ...byStage[s] })),
        trend,
        recentLeads,
    };
};

// ponytail: loads every lead into memory; switch to $group aggregation if lead counts get large.
export const loadOverview = async (owner) => {
    const [leads, totalContacts, openTasks] = await Promise.all([
        Lead.find({ owner }).select("name company status value source priority createdAt updatedAt").lean(),
        Contact.countDocuments({ owner }),
        Task.countDocuments({ owner, status: { $ne: "Completed" } }),
    ]);
    return { leads, overview: buildOverview(leads, totalContacts, openTasks) };
};

export const getOverview = asyncHandler(async (req, res) => {
    const { overview } = await loadOverview(req.user._id);
    res.json({ success: true, ...overview });
});
