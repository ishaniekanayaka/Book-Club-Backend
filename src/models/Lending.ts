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
