import { Note } from "../models/Note.js";
import { Lead } from "../models/Lead.js";
import { Contact } from "../models/Contact.js";
import { crud } from "../utils/crud.js";

export const { list: getNotes, get: getNote, create: createNote, update: updateNote, remove: deleteNote } = crud(Note, {
    key: "note",
    refs: { lead: Lead, contact: Contact },
    populate: [{ path: "lead", select: "name company" }, { path: "contact", select: "name company" }],
    filters: ["lead", "contact"],
    search: ["content"],
    sort: { pinned: -1, createdAt: -1 },
});
