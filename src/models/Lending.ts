/*
import mongoose from "mongoose";

export type LendingStatus = "borrowed" | "returned" | "overdue";

export type Lending = {
    book: mongoose.Schema.Types.ObjectId;
    reader: mongoose.Schema.Types.ObjectId;
    lendDate: Date;
    returnDate?: Date;
    dueDate: Date;
    status: LendingStatus;
};

const lendingSchema = new mongoose.Schema<Lending>(
    {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        reader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lendDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: {
            type: String,
            enum: ["borrowed", "returned", "overdue"],
            default: "borrowed",
        },
    },
    { versionKey: false, timestamps: true }
);

export const LendingModel = mongoose.model("Lending", lendingSchema);
*/
// models/Lending.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILending extends Document {
    readerId: mongoose.Types.ObjectId;
    bookId: mongoose.Types.ObjectId;
    lendDate: Date;
    dueDate: Date;
    returnDate?: Date;
    isReturned: boolean;
    fineAmount?: number;
}

const LendingSchema = new Schema<ILending>({
    readerId: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    lendDate: { type: Date, default: Date.now },
    /*dueDate: { type: Date,
        required: true,
        default: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },*/
    dueDate: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 4 * 60 * 1000), // 4 minutes from now
    },

    returnDate: { type: Date },
    isReturned: { type: Boolean, default: false },
    fineAmount: { type: Number, default: 0 },
});

export const LendingModel = mongoose.model<ILending>("Lending", LendingSchema);
