import mongoose, { Schema, Document } from "mongoose";

export interface ILending extends Document {
    _id: string;
    readerId: mongoose.Types.ObjectId;
    bookId: mongoose.Types.ObjectId;
    lendDate: Date;
    dueDate: Date;
    returnDate?: Date;
    isReturned: boolean;
    fineAmount?: number;
    returnAt?: Date;
    returnBy?: string;
    lendAt?: Date;
    lendBy?: string;
}

const LendingSchema = new Schema<ILending>(
    {
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
        returnAt: { type: Date },
        returnBy: { type: String },
        lendBy: { type: String },
        lendAt: { type: Date },
    },
    {
        versionKey: false,
    }
);

export const LendingModel = mongoose.model<ILending>("Lending", LendingSchema);
