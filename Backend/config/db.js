import mongoose from "mongoose";

export const connectDB = async () => {
    const url = process.env.MONGO_URL;

    if(!url) {
        throw new Error("MONGO_URL is not defined");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(url, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
}