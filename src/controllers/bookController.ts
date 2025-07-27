import { Request, Response, NextFunction } from "express";
import { ApiErrors } from "../errors/ApiErrors";
import { BookModel } from "../models/Book";
import { AuditLogModel } from "../models/AuditLog";

const getUserFromToken = (req: Request) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new ApiErrors(401, "Unauthorized: No token");
    const decoded = require("jsonwebtoken").verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    return { userId: decoded.userId, role: decoded.role, name: decoded.name };
};

const logAudit = async (
    action: "CREATE" | "UPDATE" | "DELETE" | "LEND" | "RETURN" | "LOGIN" | "OTHER",
    performedBy: string,
    entityType: string,
    entityId: string,
    details?: string
) => {
    await AuditLogModel.create({
        action,
        performedBy,
        entityType,
        entityId,
        details,
    });
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const {
            title,
            author,
            isbn,
            publishedDate,
            genre,
            description,
            copiesAvailable,
        } = req.body;

        const backCover = req.file?.path;

        if (isbn) {
            const existing = await BookModel.findOne({ isbn });
            if (existing) throw new ApiErrors(409, "Book with this ISBN already exists");
        }

        const book = new BookModel({
            title,
            author,
            isbn,
            publishedDate,
            genre,
            description,
            copiesAvailable,
            backCover,
            createdBy: name,
            createdAt: new Date(),
        });

        await book.save();

        await logAudit("CREATE", name, "Book", book._id.toString(), `Book '${book.title}' created`);

        res.status(201).json({ message: "Book added successfully", book });
    } catch (err) {
        next(err);
    }
};

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { genre, title, isbn } = req.query;
        const filter: any = { isDeleted: false };

        if (genre) filter.genre = genre;
        if (title) filter.title = { $regex: title, $options: "i" };
        if (isbn) filter.isbn = { $regex: isbn, $options: "i" };

        const books = await BookModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (err) {
        next(err);
    }
};

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.id;
        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });

        if (!book) throw new ApiErrors(404, "Book not found");

        res.status(200).json(book);
    } catch (err) {
        next(err);
    }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const bookId = req.params.id;
        const {
            title,
            author,
            publishedDate,
            genre,
            description,
            copiesAvailable,
        } = req.body;

        const backCover = req.file?.path;

        const updateData = {
            title,
            author,
            publishedDate,
            genre,
            description,
            copiesAvailable,
            ...(backCover && { backCover }),
            updatedBy: name,
            updatedAt: new Date(),
        };

        const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            updateData,
            { new: true }
        );

        if (!updatedBook) throw new ApiErrors(404, "Book not found");

        await logAudit("UPDATE", name, "Book", bookId, `Book '${updatedBook.title}' updated`);

        res.status(200).json({ message: "Book updated successfully", book: updatedBook });
    } catch (err) {
        next(err);
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const bookId = req.params.id;

        const deletedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            {
                isDeleted: true,
                deletedBy: name,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!deletedBook) throw new ApiErrors(404, "Book not found");

        await logAudit("DELETE", name, "Book", bookId, `Book '${deletedBook.title}' deleted`);

        res.status(200).json({ message: "Book deleted (soft) successfully" });
    } catch (err) {
        next(err);
    }
};

export const getGenres = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const genres = await BookModel.distinct("genre", { isDeleted: false });
        res.status(200).json(genres);
    } catch (err) {
        next(err);
    }
};
