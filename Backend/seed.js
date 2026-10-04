// Seeds the demo account used by the "Try the demo account" button. Safe to re-run: resets only the demo user's data.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead, LEAD_STATUSES, LEAD_PRIORITIES } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Note } from "./models/Note.js";
import { Task } from "./models/Task.js";

const DEMO = { name: "Alex Morgan", email: "alex@timetoprogram.com", password: "Test@1234", company: "Time To Program" };
const daysAgo = (n) => new Date(Date.now() - n * 864e5);

// Filler leads with deliberately uneven monthly volume so the dashboard bar chart has real peaks and dips.
const MONTHLY_VOLUME = [5, 11, 4, 15, 8, 19]; // oldest month → current month
const FIRST = ["Olivia", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Zara", "Omar", "Ivy", "Leo", "Nora", "Ryan"];
const LAST = ["Hart", "Kim", "Silva", "Novak", "Patel", "Brooks", "Khan", "Moreau", "Ito", "Grant"];
const COMPANIES = ["Acme Corp", "Vertex AI", "Bluefin", "Crestline", "Pioneer Health", "Lumen Retail", "Orbit Logistics", "Fable Studio"];
const SOURCES = ["Website", "Referral", "Cold Outreach", "Social", "Event", "Other"];
const bulkLeads = () => MONTHLY_VOLUME.flatMap((count, m) => {
    const now = new Date();
    const monthsBack = MONTHLY_VOLUME.length - 1 - m;
    return Array.from({ length: count }, (_, i) => {
        const n = m * 31 + i;
        const first = FIRST[n % FIRST.length], last = LAST[(n * 7) % LAST.length];
        const day = Math.min(1 + ((i * 5) % 27), monthsBack === 0 ? now.getDate() : 28);
        return {
            name: `${first} ${last}`,
            company: COMPANIES[n % COMPANIES.length],
            email: `${first}.${last}${n}@example.com`.toLowerCase(),
            status: LEAD_STATUSES[(n * 3) % LEAD_STATUSES.length],
            priority: LEAD_PRIORITIES[n % LEAD_PRIORITIES.length],
            source: SOURCES[(n * 3) % SOURCES.length],
            value: 4000 + ((n * 7919) % 46) * 1000,
            createdAt: new Date(now.getFullYear(), now.getMonth() - monthsBack, day, 10),
        };
    });
});

await connectDB();

let user = await User.findOne({ email: DEMO.email });
if (user) {
    await Promise.all([Lead, Contact, Note, Task].map((M) => M.deleteMany({ owner: user._id })));
} else {
    user = await User.create(DEMO);
}
const owner = user._id;

const leads = await Lead.insertMany([
    { name: "Sarah Chen", company: "Northwind Labs", email: "sarah@northwind.io", status: "New", priority: "High", source: "Website", value: 18000, createdAt: daysAgo(3) },
    { name: "Marcus Reid", company: "Globex", email: "marcus@globex.com", status: "Qualified", priority: "Medium", source: "Referral", value: 26000, createdAt: daysAgo(20) },
    { name: "Priya Nair", company: "Initech", email: "priya@initech.com", status: "Proposal", priority: "High", source: "Event", value: 42000, createdAt: daysAgo(45) },
    { name: "Daniel Ortiz", company: "Umbrella Co", email: "dan@umbrella.co", status: "Won", priority: "Medium", source: "Cold Outreach", value: 31000, createdAt: daysAgo(70) },
    { name: "Emma Walsh", company: "Stark Retail", email: "emma@stark.shop", status: "Won", priority: "Low", source: "Social", value: 12500, createdAt: daysAgo(110) },
    { name: "Liam Becker", company: "Hooli", email: "liam@hooli.xyz", status: "Lost", priority: "Low", source: "Website", value: 9000, createdAt: daysAgo(140) },
    ...bulkLeads(),
].map((l, order) => ({ ...l, owner, order, updatedAt: l.createdAt })));

const contacts = await Contact.insertMany([
    { name: "Sarah Chen", company: "Northwind Labs", title: "VP Operations", email: "sarah@northwind.io", tags: ["decision-maker"], favorite: true },
    { name: "Marcus Reid", company: "Globex", title: "Head of IT", email: "marcus@globex.com", tags: ["technical"] },
    { name: "Priya Nair", company: "Initech", title: "CFO", email: "priya@initech.com", tags: ["decision-maker", "finance"], favorite: true },
].map((c) => ({ ...c, owner })));

await Note.insertMany([
    { owner, content: "Wants a demo of the reporting module next week.", lead: leads[0]._id, contact: contacts[0]._id, pinned: true },
    { owner, content: "Budget approved for Q4; waiting on legal review of the proposal.", lead: leads[2]._id },
]);

await Task.insertMany([
    { owner, title: "Schedule product demo", dueDate: daysAgo(-2), priority: "High", relatedLead: leads[0]._id },
    { owner, title: "Send revised proposal", dueDate: daysAgo(-5), priority: "High", status: "In Progress", relatedLead: leads[2]._id },
    { owner, title: "Follow up on security questionnaire", dueDate: daysAgo(1), priority: "Medium", relatedLead: leads[1]._id },
]);

console.log(`Seeded demo account ${DEMO.email}`);
await mongoose.disconnect();
