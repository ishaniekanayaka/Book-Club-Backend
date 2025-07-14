import mongoose from "mongoose";

export type User = {
    name: string;
    email: string;
    password: string;
    role: "staff" | "librarian" | "reader";
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    profileImage?: string;
    isActive?: boolean;
    createdAt?: Date;
    memberId?: string | null;
    nic?: string;
};

const generateMemberId = (prefix: string): string => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit random
    return `${prefix}-${year}-${randomDigits}`;
};

const userSchema = new mongoose.Schema<User>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            minlength: [3, "Name must be at least 3 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Email must be valid"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["staff", "librarian", "reader"],
            default: "reader",
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
        },
        profileImage: {
            type: String,
            // Optional match (if image is hosted remotely)
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/, "Must be a valid image URL"],
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
            sparse: true, // allow null values to be non-unique
            default: null,
        },
        nic: {
            type: String,
            trim: true,
            unique: true,
            match: [/^\d{9}[vVxX]$|^\d{12}$/, "NIC must be valid (e.g., 991234567V or 200012345678)"],
        },
    },
    {
        versionKey: false,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.memberId) {
        let prefix = "";
        if (this.role === "reader") prefix = "Reader";
        else if (this.role === "librarian") prefix = "Librarian";
        else if (this.role === "staff") prefix = "Staff";
        else prefix = "U"; // fallback if needed

        let newMemberId = generateMemberId(prefix);

        // Ensure uniqueness
        while (await mongoose.models.User.findOne({ memberId: newMemberId })) {
            newMemberId = generateMemberId(prefix);
        }

        this.memberId = newMemberId;
    }
    next();
});


export const UserModel = mongoose.model("User", userSchema);