import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { BookModel } from "../models/Book";
import { ApiErrors } from "../errors/ApiErrors";

export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookId, readerId, dueDate } = req.body;

        const book = await BookModel.findById(bookId);
        if (!book || book.isDeleted) throw new ApiErrors(404, "Book not found");
        if (book.copiesAvailable < 1) throw new ApiErrors(400, "No copies available");

        const lending = await LendingModel.create({
            book: bookId,
            reader: readerId,
            dueDate,
        });

        book.copiesAvailable -= 1;
        await book.save();

        res.status(201).json({ message: "Book lent successfully", lending });
    } catch (err) {
        next(err);
    }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lendingId } = req.params;

        const lending = await LendingModel.findById(lendingId).populate("book");
        if (!lending) throw new ApiErrors(404, "Lending record not found");

        if (lending.status === "returned")
            throw new ApiErrors(400, "Book already returned");

        lending.status = "returned";
        lending.returnDate = new Date();

        await lending.save();

        const book = await BookModel.findById(lending.book);
        if (book) {
            book.copiesAvailable += 1;
            await book.save();
        }

        res.status(200).json({ message: "Book returned successfully", lending });
    } catch (err) {
        next(err);
    }
};

export const getLendingHistoryByReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readerId = req.params.readerId;
        const history = await LendingModel.find({ reader: readerId }).populate("book");
        res.status(200).json(history);
    } catch (err) {
        next(err);
    }
};

export const getLendingHistoryByBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.bookId;
        const history = await LendingModel.find({ book: bookId }).populate("reader");
        res.status(200).json(history);
    } catch (err) {
        next(err);
    }
};
