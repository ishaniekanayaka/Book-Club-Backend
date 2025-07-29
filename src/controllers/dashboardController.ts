import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";
import { UserModel } from "../models/User";
import { LendingModel } from "../models/Lending";
import {ReaderModel} from "../models/Reader";

export const getTotalBooks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await BookModel.countDocuments({ isDeleted: false });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};

export const getTotalReaders = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await ReaderModel.countDocuments({isActive: true });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};

export const getTotalStaff = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await UserModel.countDocuments({ role: { $in: ["staff"] }, isActive: true });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};

export const getTotalLibrarian = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await UserModel.countDocuments({ role: { $in: ["librarian"] }, isActive: true });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};

export const getActiveLendings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await LendingModel.countDocuments({ isReturned: "true" });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};

export const getOverdueBooks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        const count = await LendingModel.countDocuments({
            dueDate: { $lt: today },
            isReturned: "false"
        });
        res.json({ total: count });
    } catch (err) {
        next(err);
    }
};
export const getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        const [
            totalBooks,
            totalReaders,
            totalStaff,
            totalLibrarians,
            activeLendings,
            overdueBooks,
        ] = await Promise.all([
            BookModel.countDocuments({ isDeleted: false }),
            ReaderModel.countDocuments({ isActive: true }),
            UserModel.countDocuments({ role: "staff", isActive: true }),
            UserModel.countDocuments({ role: "librarian", isActive: true }),
            LendingModel.countDocuments({ isReturned: "false" }),
            LendingModel.countDocuments({ dueDate: { $lt: today }, isReturned: "false" }),
        ]);

        res.status(200).json({
            totalBooks,
            totalReaders,
            totalStaff,
            totalLibrarians,
            activeLendings,
            overdueBooks,
        });
    } catch (error) {
        next(error);
    }
};
