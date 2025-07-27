import { Request, Response, NextFunction } from "express";
import { AuditLogModel } from "../models/AuditLog";

export const getAllAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await AuditLogModel.find().sort({ timestamp: -1 }); // Latest first
        res.status(200).json(logs);
    } catch (err) {
        next(err);
    }
};
