import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiErrors } from "../errors/ApiErrors";

interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiErrors(401, "Access token missing or malformed"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
        req.user = decoded; // attach user data (userId, role)
        next();
    } catch (error) {
        return next(new ApiErrors(401, "Invalid or expired token"));
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiErrors(403, "You are not authorized to access this resource"));
        }
        next();
    };
};
