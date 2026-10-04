import { Task } from "../models/Task.js";
import { Lead } from "../models/Lead.js";
import { Contact } from "../models/Contact.js";
import { crud } from "../utils/crud.js";

export const { list: getTasks, get: getTask, create: createTask, update: updateTask, remove: deleteTask } = crud(Task, {
    key: "task",
    refs: { relatedLead: Lead, relatedContact: Contact },
    populate: [{ path: "relatedLead", select: "name company" }, { path: "relatedContact", select: "name company" }],
    filters: ["status", "priority", "relatedLead"],
    search: ["title", "description"],
});
