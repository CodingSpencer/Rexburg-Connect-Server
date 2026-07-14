import type {
    ErrorRequestHandler,
  } from "express";
  
  interface AppError extends Error {
    statusCode?: number;
  }
  
  export const errorMiddleware: ErrorRequestHandler = (
    error: AppError,
    _req,
    res,
    _next
  ) => {
    console.error(error);
  
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        error: "You have already reviewed this event.",
      });
      return;
    }
  
    res.status(error.statusCode ?? 500).json({
      error:
        error.message ||
        "Something went wrong on the server.",
    });
  };