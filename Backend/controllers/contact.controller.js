import { Contact } from "../models/Contact.js";
import { crud } from "../utils/crud.js";

export const { list: getContacts, get: getContact, create: createContact, update: updateContact, remove: deleteContact } = crud(Contact, {
    key: "contact",
    filters: ["favorite"],
    search: ["name", "email", "company"],
    sort: { favorite: -1, createdAt: -1 },
});
