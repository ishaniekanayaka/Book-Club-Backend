import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { ApiErrors } from "../errors/ApiErrors";
import { BookModel } from "../models/Book";
import { ReaderModel } from "../models/Reader";
import {sendOverdueEmail} from "../utils/sendEmail";
import jwt from "jsonwebtoken";

const getUserFromToken = (req: Request) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new ApiErrors(401, "Unauthorized: No token");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    return { userId: decoded.userId, role: decoded.role, name: decoded.name };
};


const DEFAULT_DUE_MINUTES = 4;
const FINE_PER_10_MIN_BLOCK = 5;

export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nic, memberId, isbn, dueDate } = req.body;
        const { name } = getUserFromToken(req);
        // Find reader using either NIC or memberId
        const reader = await ReaderModel.findOne({
            $or: [{ nic }, { memberId }],
        });

        if (!reader) throw new ApiErrors(404, "Reader not found");

        const book = await BookModel.findOne({ isbn });
        if (!book || book.copiesAvailable <= 0) {
            throw new ApiErrors(404, "Book not available");
        }

        const lendDate = new Date();
        const finalDueDate = dueDate
            ? new Date(dueDate)
            : new Date(lendDate.getTime() + DEFAULT_DUE_MINUTES * 60 * 1000);

        const lend = await LendingModel.create({
            readerId: reader._id,
            bookId: book._id,
            lendDate,
            dueDate: finalDueDate,
            lendBy: name,
            lendAt: new Date(),
        });

        book.copiesAvailable -= 1;
        await book.save();

        // Reminder email logic
        const msUntilReminder = finalDueDate.getTime() - Date.now() - 60 * 1000; // 1 minute before due
        if (msUntilReminder > 0) {
            setTimeout(async () => {
                const updated = await LendingModel.findById(lend._id);
                if (updated && !updated.isReturned) {
                    await sendOverdueEmail(
                        reader.email,
                        reader.fullName,
                        [{ title: book.title, dueDate: finalDueDate }]
                    );
                    console.log(`📧 Reminder sent for lending ${lend._id}`);
                }
            }, msUntilReminder);
        }

        res.status(201).json({ message: "Book lent successfully", lend });
    } catch (err) {
        next(err);
    }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const { id } = req.params;
        const lending = await LendingModel.findById(id);
        if (!lending) throw new ApiErrors(404, "Lending record not found");

        if (lending.isReturned) {
            return res.status(400).json({ message: "Book already returned" });
        }

        const returnDate = new Date();
        let fine = 0;


        if (returnDate > lending.dueDate) {
            const msLate = returnDate.getTime() - lending.dueDate.getTime();
            const minutesLate = Math.ceil(msLate / (1000 * 60));
            const tenMinBlocks = Math.ceil(minutesLate / 10);
            fine = tenMinBlocks * FINE_PER_10_MIN_BLOCK;
        }

        lending.returnDate = returnDate;
        lending.isReturned = true;
        lending.fineAmount = fine;
        await lending.save();


        await BookModel.findByIdAndUpdate(lending.bookId, { $inc: { copiesAvailable: 1 } });

        res.status(200).json({ message: "Book returned", lending });
    } catch (err) {
        next(err);
    }
};


export const getLendingsByBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isbn } = req.params;

        // Step 1: Find the book by ISBN
        const book = await BookModel.findOne({ isbn });
        if (!book) {
            throw new ApiErrors(404, "Book not found with the given ISBN");
        }

        // Step 2: Use the book ID to find lendings
        const lendings = await LendingModel.find({ bookId: book._id })
            .populate("readerId", "fullName email")
            .populate("bookId", "title");

        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};



export const getLendingsByReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { readerId } = req.params;
        const lendings = await LendingModel.find({ readerId }).populate("bookId", "title");
        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};


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

export const getAllLendings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lendings = await LendingModel.find()
            .populate("readerId", "fullName email")
            .populate("bookId", "title isbn");
        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};

export const getReturnedOverdueLendings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const allReturned = await LendingModel.find({ isReturned: true })
            .populate("readerId", "fullName email")
            .populate("bookId", "title isbn");

        const returnedOverdues = allReturned.filter(
            (lending) =>
                lending.returnDate &&
                lending.dueDate &&
                new Date(lending.returnDate) > new Date(lending.dueDate)
        );

        res.status(200).json(returnedOverdues);
    } catch (err) {
        next(err);
    }
};


export const sendOverdueNotifications = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const overdueLendings = await LendingModel.find({
            dueDate: { $lt: now },
            isReturned: false,
        })
            .populate("readerId")
            .populate("bookId");

        // Group by readerId
        const readerMap: Map<string, { email: string; name: string; books: { title: string; dueDate: Date }[] }> =
            new Map();

        overdueLendings.forEach((lending) => {
            const reader: any = lending.readerId;
            const book: any = lending.bookId;

            if (!readerMap.has(reader._id.toString())) {
                readerMap.set(reader._id.toString(), {
                    email: reader.email,
                    name: reader.fullName,
                    books: [],
                });
            }

            readerMap.get(reader._id.toString())?.books.push({
                title: book.title,
                dueDate: lending.dueDate,
            });
        });

        // Send emails
        for (const [_, { email, name, books }] of readerMap.entries()) {
            await sendOverdueEmail(email, name, books);
            console.log(`📧 Overdue email sent to ${name}`);
        }

        res.status(200).json({ message: "Overdue notifications sent successfully", count: readerMap.size });
    } catch (err) {
        next(err);
    }
};