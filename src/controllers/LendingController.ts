// controllers/lendingController.ts
import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { ApiErrors } from "../errors/ApiErrors";
import { BookModel } from "../models/Book";

const DAILY_FINE = 15; // ₹15 per day

// Lend a book
export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { readerId, bookId, dueDate } = req.body;

        // Check if book exists and is available
        const book = await BookModel.findById(bookId);
        if (!book || book.copiesAvailable <= 0) throw new ApiErrors(404, "Book not available");

        const lend = await LendingModel.create({
            readerId,
            bookId,
            dueDate,
        });

        // Decrease book stock
        book.copiesAvailable -= 1;
        await book.save();

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

        if (lending.isReturned) return res.status(400).json({ message: "Book already returned" });

        const returnDate = new Date();
        let fine = 0;

        if (returnDate > lending.dueDate) {
            const daysLate = Math.ceil((+returnDate - +lending.dueDate) / (1000 * 60 * 60 * 24));
            fine = daysLate * DAILY_FINE;
        }

        lending.returnDate = returnDate;
        lending.isReturned = true;
        lending.fineAmount = fine;
        await lending.save();

        // Increase book stock
        await BookModel.findByIdAndUpdate(lending.bookId, { $inc: { quantity: 1 } });

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

// Overdue readers and books
export const getOverdueLendings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        const overdue = await LendingModel.find({
            dueDate: { $lt: today },
            isReturned: false,
        }).populate("readerId bookId");

        res.status(200).json({ message: "Overdue books", overdue });
    } catch (err) {
        next(err);
    }
};
