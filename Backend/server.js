import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.route.js";
import leadRoutes from "./routes/lead.route.js";
import contactRoutes from "./routes/contact.route.js";
import noteRoutes from "./routes/note.route.js";
import taskRoutes from "./routes/task.route.js";
import aiRoutes from "./routes/ai.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

const app = express();

app.use(
    cors({
        // In dev, accept any localhost port (Vite moves to 5174+ when 5173 is busy).
        origin: process.env.NODE_ENV === "production"
            ? process.env.CLIENT_URL
            : [process.env.CLIENT_URL || "http://localhost:5173", /^http:\/\/localhost:\d+$/],
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));


app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "API is running", status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () =>
            console.log(`CRM App running on PORT ${PORT}`));
    }
    catch (err) {
        console.log(`Failed to start the server on PORT ${PORT}`, err.message);
        process.exit(1);
    }

};

start();

export default app;