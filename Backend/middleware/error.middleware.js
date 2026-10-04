import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if(err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if(err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate field value entered for ${field}`;
    }

    if(err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if(err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    if(err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors || {}).map(error => error.message).join(", ");
    }

    if(process.env.NODE_ENV !== "production" && statusCode === 500) {
        console.log(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && statusCode === 500 ? { stack: err.stack } : {}),
    });
};