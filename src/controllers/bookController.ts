import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";
import { ApiErrors } from "../errors/ApiErrors";

// ✅ Add a new book
export const addBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            author,
            isbn,
            publishedDate,
            genre,
            description,
            copiesAvailable,
        } = req.body;

        const profileImage = req.file?.path;

        if (isbn) {
            const existing = await BookModel.findOne({ isbn });
            if (existing) throw new ApiErrors(409, "Book with this ISBN already exists");
        }

        const newBook = new BookModel({
            title,
            author,
            isbn,
            publishedDate,
            genre,
            description,
            copiesAvailable,
            profileImage,
        });

        await newBook.save();

        res.status(201).json({
            message: "Book added successfully",
            book: newBook,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Get all books (with optional genre filter)
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { genre } = req.query;
        const filter: any = { isDeleted: false };
        if (genre) filter.genre = genre;

        const books = await BookModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (err) {
        next(err);
    }
};

// ✅ Get book by ID
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

// ✅ Update book
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.id;
        const {
            title,
            author,
            publishedDate,
            genre,
            description,
            copiesAvailable,
        } = req.body;

        const profileImage = req.file?.path;

        const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            {
                title,
                author,
                publishedDate,
                genre,
                description,
                copiesAvailable,
                ...(profileImage && { profileImage }),
            },
            { new: true }
        );

        if (!updatedBook) throw new ApiErrors(404, "Book not found");

        res.status(200).json({
            message: "Book updated successfully",
            book: updatedBook,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Soft delete book
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.id;

        const deletedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!deletedBook) throw new ApiErrors(404, "Book not found");

        res.status(200).json({
            message: "Book deleted (soft) successfully",
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Optional: Restore deleted book
export const restoreBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.id;

        const restoredBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: true },
            { isDeleted: false },
            { new: true }
        );

        if (!restoredBook) throw new ApiErrors(404, "Book not found");

        res.status(200).json({
            message: "Book restored successfully",
            book: restoredBook,
        });
    } catch (err) {
        next(err);
    }
};
