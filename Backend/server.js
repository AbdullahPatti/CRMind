import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import {connectDB} from "./config/db.js";
import {notFound, errorHandler} from "./middleware/error.middleware.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({extended: true}));
if(process.env.NODE_ENV !== "production") app.use(morgan("dev"));


app.get("/api/health", (req, res) => {
    res.json({sucess: "true", message: "API is running", status: "OK"});
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const start = async() => {
    try{
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