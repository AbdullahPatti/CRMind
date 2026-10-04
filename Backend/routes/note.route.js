import { Router } from "express";
import { getNotes, getNote, createNote, updateNote, deleteNote } from "../controllers/note.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNote).put(updateNote).delete(deleteNote);

export default router;
