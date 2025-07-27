import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ["CREATE", "UPDATE", "DELETE", "LEND", "RETURN", "LOGIN", "OTHER"],
        required: true,
    },
    performedBy: { type: String, required: true }, // Name or user ID
    entityType: { type: String, required: true }, // e.g., 'Reader', 'Book'
    entityId: { type: String, required: true }, // ObjectId of the affected document
    timestamp: { type: Date, default: Date.now },
    details: { type: String }, // Optional description or message
});

export const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);
