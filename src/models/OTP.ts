import mongoose, { Schema, Document } from "mongoose";

interface OtpDocument extends Document {
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

export default mongoose.model<OtpDocument>("Otp", otpSchema);
