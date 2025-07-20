import mongoose from "mongoose";

export type Reader = {
    fullName: string;
    nic: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    profileImage?: string;
    isActive?: boolean;
    createdAt?: Date;
    memberId?: string | null;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
};

const generateMemberId = (): string => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `M-${year}-${randomDigits}`;
};

const readerSchema = new mongoose.Schema<Reader>(
    {
        fullName: {
            type: String,
            required: [true, "Name is required"],
            minlength: [3, "Name must be at least 3 characters"],
            trim: true,
        },
        nic: {
            type: String,
            trim: true,
            unique: true,
            match: [/^\d{9}[vVxX]$|^\d{12}$/, "NIC must be valid (e.g., 991234567V or 200012345678)"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Email must be valid"],
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: [true, "Date of Birth is required"],
        },
        profileImage: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        memberId: {
            type: String,
            unique: true,
            trim: true,
        },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: String,
        },
        updatedAt: {
            type: Date,
        },
        deletedBy: {
            type: String,
        },
        deletedAt: {
            type: Date,
        },

    },
    {
        versionKey: false,
    }
);

readerSchema.pre("save", function (next) {
    if (!this.memberId) {
        this.memberId = generateMemberId();
    }
    next();
});

export const ReaderModel = mongoose.model("Reader", readerSchema);
