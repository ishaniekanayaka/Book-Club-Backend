import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { ApiErrors } from "../errors/ApiErrors";
import { BookModel } from "../models/Book";
import { sendOverdueEmail } from "../utils/sendEmail";

import {ReaderModel} from "../models/Reader";

const DEFAULT_DUE_MINUTES = 4;
const FINE_PER_10_MIN_BLOCK = 5;

// Lend a book
export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { readerId, bookId, dueDate } = req.body;

        // Validate book
        const book = await BookModel.findById(bookId);
        if (!book || book.copiesAvailable <= 0) {
            throw new ApiErrors(404, "Book not available");
        }

        // Validate reader
        const reader = await ReaderModel.findById(readerId);
        if (!reader) throw new ApiErrors(404, "Reader not found");

        const lendDate = new Date();
        const finalDueDate = dueDate
            ? new Date(dueDate)
            : new Date(lendDate.getTime() + DEFAULT_DUE_MINUTES * 60 * 1000);

        const lend = await LendingModel.create({
            readerId,
            bookId,
            lendDate,
            dueDate: finalDueDate,
        });

        // Decrease book stock
        book.copiesAvailable -= 1;
        await book.save();

        // Schedule reminder 1 minute before dueDate
        const msUntilReminder = finalDueDate.getTime() - Date.now() - 60 * 1000;

        if (msUntilReminder > 0) {
            setTimeout(async () => {
                const updatedLending = await LendingModel.findById(lend._id);
                if (updatedLending && !updatedLending.isReturned) {
                    await sendOverdueEmail(
                        reader.email,
                        reader.fullName,
                        book.title,
                        finalDueDate
                    );
                }
            }, msUntilReminder);
        }

        res.status(201).json({ message: "Book lent successfully", lend });
    } catch (err) {
        next(err);
    }
};

// Return a book
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const lending = await LendingModel.findById(id);
        if (!lending) throw new ApiErrors(404, "Lending record not found");

        if (lending.isReturned) {
            return res.status(400).json({ message: "Book already returned" });
        }

        const returnDate = new Date();
        let fine = 0;

        // Fine logic based on minutes
        if (returnDate > lending.dueDate) {
            const msLate = returnDate.getTime() - lending.dueDate.getTime();
            const minutesLate = Math.ceil(msLate / (1000 * 60));

            if (minutesLate >= 1) {
                const tenMinBlocks = Math.ceil(minutesLate / 10);
                fine = tenMinBlocks * FINE_PER_10_MIN_BLOCK;
            }
        }

        lending.returnDate = returnDate;
        lending.isReturned = true;
        lending.fineAmount = fine;
        await lending.save();

        // Increase book stock
        await BookModel.findByIdAndUpdate(lending.bookId, { $inc: { copiesAvailable: 1 } });

        res.status(200).json({ message: "Book returned", lending });
    } catch (err) {
        next(err);
    }
};

// Get lending history by book
export const getLendingsByBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookId } = req.params;
        const lendings = await LendingModel.find({ bookId }).populate("readerId", "name email");
        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};

// Get lending history by reader
export const getLendingsByReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { readerId } = req.params;
        const lendings = await LendingModel.find({ readerId }).populate("bookId", "title");
        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};

// Get overdue lendings
export const getOverdueLendings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const overdue = await LendingModel.find({
            dueDate: { $lt: now },
            isReturned: false,
        }).populate("readerId bookId");

        res.status(200).json({ message: "Overdue books", overdue });
    } catch (err) {
        next(err);
    }
};
