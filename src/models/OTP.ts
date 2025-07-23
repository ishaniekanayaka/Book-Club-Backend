import mongoose, { Schema, Document } from "mongoose";

export interface OtpDocument extends Document {
    email: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
}

const otpSchema = new Schema<OtpDocument>({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});

export const OtpModel = mongoose.model<OtpDocument>("Otp", otpSchema);
