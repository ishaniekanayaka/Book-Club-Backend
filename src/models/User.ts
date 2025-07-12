import mongoose from "mongoose";

export type User = {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "librarian" | "reader";
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    profileImage?: string;
    isActive?: boolean;
    createdAt?: Date;
    memberId?: string | null;
    nic?: string;
};

// Function to generate unique memberId
const generateMemberId = (): string => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit random
    return `MEM-${year}-${randomDigits}`;
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
            enum: ["admin", "librarian", "reader"],
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
            sparse: true, // allows null + unique
            default: null,
        },
        nic: {
            type: String,
            trim: true,
            match: [/^\d{9}[vVxX]|\d{12}$/, "NIC must be valid (e.g., 991234567V or 200012345678)"],
        },
    },
    {
        versionKey: false,
    }
);

// 👇 Auto-generate memberId only for "reader"
userSchema.pre("save", async function (next) {
    if (this.role === "reader" && !this.memberId) {
        let newMemberId = generateMemberId();

        // Ensure uniqueness
        while (await mongoose.models.User.findOne({ memberId: newMemberId })) {
            newMemberId = generateMemberId();
        }

        this.memberId = newMemberId;
    }

    // If not reader, make sure memberId is null
    if (this.role !== "reader") {
        this.memberId = null;
    }

    next();
});

export const UserModel = mongoose.model("User", userSchema);
