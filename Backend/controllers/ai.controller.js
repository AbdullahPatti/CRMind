import { GoogleGenAI } from "@google/genai";
import { Lead } from "../models/Lead.js";
import { Note } from "../models/Note.js";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { loadOverview } from "./analytics.controller.js";

const model = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";
const clampScore = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

let client;
const getClient = () => {
    if (!process.env.GEMINI_API_KEY) throw new ApiError(503, "AI is not configured. Set GEMINI_API_KEY on the server.");
    return (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));
};

// Ask Gemini for a JSON object of the given shape.
// Falls back to a lighter model once if the primary is overloaded.
const askJson = async (prompt, shape) => {
    const models = [model(), process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest"];
    let text;
    for (const [i, name] of models.entries()) {
        try {
            const res = await getClient().models.generateContent({
                model: name,
                contents: `${prompt}\n\nRespond ONLY with a JSON object of this exact shape:\n${shape}`,
                config: { responseMimeType: "application/json", temperature: 0.7, abortSignal: AbortSignal.timeout(30000) },
            });
            text = res.text;
            break;
        } catch (err) {
            if (err instanceof ApiError) throw err;
            const busy = err.status === 503 || err.status === 429 || err.name === "AbortError" || err.name === "TimeoutError";
            if (busy && i < models.length - 1) continue;
            if (busy) throw new ApiError(503, "AI service is busy right now. Please try again shortly.");
            throw new ApiError(502, `AI request failed: ${err.message}`);
        }
    }
    try {
        return JSON.parse(text);
    } catch {
        throw new ApiError(502, "AI returned an invalid response");
    }
};

const findLead = async (req) => {
    const { leadId } = req.body;
    if (!leadId) throw new ApiError(400, "leadId is required");
    const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
    if (!lead) throw new ApiError(404, "Lead not found");
    return lead;
};

const describeLead = (lead) =>
    JSON.stringify({
        name: lead.name, company: lead.company, email: lead.email, status: lead.status,
        priority: lead.priority, source: lead.source, value: lead.value, notes: lead.notes,
        tags: lead.tags, createdAt: lead.createdAt, updatedAt: lead.updatedAt,
    });

export const getStatus = (req, res) => {
    res.json({ success: true, configured: Boolean(process.env.GEMINI_API_KEY), model: model() });
};

export const leadSummary = asyncHandler(async (req, res) => {
    const lead = await findLead(req);
    const [notes, tasks] = await Promise.all([
        Note.find({ owner: req.user._id, lead: lead._id }).sort({ createdAt: -1 }).limit(10).select("content createdAt").lean(),
        Task.find({ owner: req.user._id, relatedLead: lead._id }).limit(10).select("title status dueDate priority").lean(),
    ]);

    const out = await askJson(
        `You are a senior B2B sales analyst. Today is ${new Date().toDateString()}. Analyse this CRM lead.\n` +
        `Lead: ${describeLead(lead)}\nNotes: ${JSON.stringify(notes)}\nTasks: ${JSON.stringify(tasks)}`,
        `{"summary": string (2-3 sentences), "riskScore": integer 0-100 (higher = more likely to be lost), "suggestedPriority": "Low"|"Medium"|"High", "nextBestAction": string (one sentence)}`
    );

    const riskScore = clampScore(out.riskScore);
    const suggestedPriority = ["Low", "Medium", "High"].includes(out.suggestedPriority) ? out.suggestedPriority : lead.priority;

    lead.aiSummary = String(out.summary || "");
    lead.aiRiskScore = riskScore;
    await lead.save();

    res.json({ success: true, summary: lead.aiSummary, riskScore, suggestedPriority, nextBestAction: String(out.nextBestAction || "") });
});

export const generateEmail = asyncHandler(async (req, res) => {
    const lead = await findLead(req);
    const purpose = String(req.body.purpose || "Follow-up").slice(0, 100);
    const tone = String(req.body.tone || "Friendly & professional").slice(0, 100);
    const sender = req.user.company ? `${req.user.name}, ${req.user.company}` : req.user.name;

    const out = await askJson(
        `Write a concise sales email to this lead.\nPurpose: ${purpose}\nTone: ${tone}\nSender: ${sender}\n` +
        `Lead: ${describeLead(lead)}\n` +
        `Sign off with the sender's name. Plain text with line breaks, no markdown, no placeholders like [Name].`,
        `{"subject": string, "body": string}`
    );

    res.json({ success: true, subject: String(out.subject || ""), body: String(out.body || "") });
});

export const salesInsights = asyncHandler(async (req, res) => {
    const { leads, overview } = await loadOverview(req.user._id);
    if (!leads.length) throw new ApiError(400, "Add some leads first to get insights");

    const bySource = {};
    for (const l of leads) {
        const s = (bySource[l.source] ??= { total: 0, won: 0, lost: 0 });
        s.total += 1;
        if (l.status === "Won") s.won += 1;
        if (l.status === "Lost") s.lost += 1;
    }
    const now = Date.now();
    const stale = leads
        .filter((l) => l.status !== "Won" && l.status !== "Lost")
        .map((l) => ({ name: l.name, status: l.status, value: l.value, priority: l.priority, daysSinceUpdate: Math.floor((now - new Date(l.updatedAt)) / 864e5) }))
        .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
        .slice(0, 10);

    const out = await askJson(
        `You are a sales operations expert. Analyse this CRM pipeline and give actionable insights.\n` +
        `Stats: ${JSON.stringify(overview.stats)}\nPipeline by stage: ${JSON.stringify(overview.pipeline)}\n` +
        `Monthly trend: ${JSON.stringify(overview.trend)}\nOutcomes by source: ${JSON.stringify(bySource)}\n` +
        `Least recently updated open deals: ${JSON.stringify(stale)}`,
        `{"headline": string (one sentence), "insights": string[] (3 items), "recommendations": string[] (3 items), "healthScore": integer 0-100}`
    );

    res.json({
        success: true,
        headline: String(out.headline || ""),
        insights: Array.isArray(out.insights) ? out.insights.map(String) : [],
        recommendations: Array.isArray(out.recommendations) ? out.recommendations.map(String) : [],
        healthScore: clampScore(out.healthScore),
    });
});
