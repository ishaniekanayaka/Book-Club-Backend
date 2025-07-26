import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";
import { ApiErrors } from "../errors/ApiErrors";


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

        const backCover = req.file?.path;

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
            backCover,
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

/*
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
};*/

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { genre, title, isbn } = req.query;
        const filter: any = { isDeleted: false };

        if (genre) filter.genre = genre;
        if (title) filter.title = { $regex: title, $options: "i" }; // partial match (case-insensitive)
        if (isbn) filter.isbn = { $regex: isbn, $options: "i" };   // partial match (case-insensitive)

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

        const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            {
                title,
                author,
                publishedDate,
                genre,
                description,
                copiesAvailable,
                ...(backCover && { backCover }),
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


export const getGenres = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const genres = await BookModel.distinct("genre", { isDeleted: false });
        res.status(200).json(genres);
    } catch (err) {
        next(err);
    }
};

