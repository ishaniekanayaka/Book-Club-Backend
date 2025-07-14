import mongoose from "mongoose";

export type Book = {
    title: string;
    author: string;
    isbn?: string;
    publishedDate?: Date;
    genre?: string;
    description?: string;
    copiesAvailable: number;
    backCover?: string;
    isDeleted?: boolean;
};

const generateISBN = (): string => {
    const prefix = "ISBN";
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${timestamp}-${random}`;
};

const bookSchema = new mongoose.Schema<Book>(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        isbn: {
            type: String,
            unique: true,
            trim: true,
            sparse: true,
        },
        publishedDate: Date,
        genre: { type: String, trim: true },
        description: String,
        copiesAvailable: { type: Number, default: 1 },
        backCover: {
            type: String,
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/, "Must be a valid image URL"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { versionKey: false, timestamps: true }
);

// Auto-generate ISBN if not provided
bookSchema.pre("save", async function (next) {
    if (!this.isbn) {
        let newISBN = generateISBN();
        while (await mongoose.models.Book.findOne({ isbn: newISBN })) {
            newISBN = generateISBN();
        }
        this.isbn = newISBN;
    }
    next();
});

export const BookModel = mongoose.model("Book", bookSchema);
