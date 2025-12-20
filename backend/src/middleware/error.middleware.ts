import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
    });
};

export default errorMiddleware;
