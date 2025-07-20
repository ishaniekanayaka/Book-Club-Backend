import { Request, Response, NextFunction } from "express";
import { ApiErrors } from "../errors/ApiErrors";
import jwt from "jsonwebtoken";
import {ReaderModel} from "../models/Reader";
import {sendWelcomeEmail} from "../utils/sendEmail";


const getUserFromToken = (req: Request) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new ApiErrors(401, "Unauthorized: No token");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    return { userId: decoded.userId, role: decoded.role, name: decoded.name };
};
/*

export const createReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const profileImage = req.file?.path;

        const reader = new ReaderModel({
            ...req.body,
            profileImage,
            createdBy: name,
            createdAt: new Date(),
        });

        await reader.save();
        res.status(201).json({ message: "Reader added", reader });
    } catch (err: any) {
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((val: any) => val.message);
            return next(new ApiErrors(400, messages.join(", ")));
        }
        next(err);
    }
};
*/

export const createReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const profileImage = req.file?.path;

        const reader = new ReaderModel({
            ...req.body,
            profileImage,
            createdBy: name,
            createdAt: new Date(),
        });

        await reader.save();

        // Send welcome email if reader isActive = true
        if (reader.isActive && reader.email) {
            await sendWelcomeEmail(reader.email, reader.fullName);
        }

        res.status(201).json({ message: "Reader added", reader });
    } catch (err: any) {
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((val: any) => val.message);
            return next(new ApiErrors(400, messages.join(", ")));
        }
        next(err);
    }
};

export const updateReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const { id } = req.params;
        const profileImage = req.file?.path;

        const update = {
            ...req.body,
            ...(profileImage && { profileImage }),
            updatedBy: name,
            updatedAt: new Date(),
        };

        const updated = await ReaderModel.findByIdAndUpdate(id, update, { new: true });
        if (!updated) throw new ApiErrors(404, "Reader not found");

        res.status(200).json({ message: "Reader updated", updated });
    } catch (err) {
        next(err);
    }
};
export const getAllReaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readers = await ReaderModel.find({ isActive: true });
        res.status(200).json(readers);
    } catch (err) {
        next(err);
    }
};

export const deleteReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const { id } = req.params;
        const deleted = await ReaderModel.findByIdAndUpdate(
            id,
            { isActive: false, deletedBy: name, deletedAt: new Date() },
            { new: true }
        );
        if (!deleted) throw new ApiErrors(404, "Reader not found");
        res.status(200).json({ message: "Reader soft deleted", deleted });
    } catch (err) {
        next(err);
    }
};

export const getReaderLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const reader = await ReaderModel.findById(id);
        if (!reader) throw new ApiErrors(404, "Reader not found");

        const logs = {
            createdBy: reader.createdBy,
            createdAt: reader.createdAt,
            updatedBy: reader.updatedBy,
            updatedAt: reader.updatedAt,
            deletedBy: reader.deletedBy,
            deletedAt: reader.deletedAt,
        };

        res.status(200).json({ message: "Reader logs", logs });
    } catch (err) {
        next(err);
    }
};
