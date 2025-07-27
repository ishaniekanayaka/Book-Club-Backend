import { AuditLogModel } from "../models/AuditLog";

export const logAudit = async ({
                                   action,
                                   performedBy,
                                   entityType,
                                   entityId,
                                   details = "",
                               }: {
    action: "CREATE" | "UPDATE" | "DELETE" | "LEND" | "RETURN" | "LOGIN" | "OTHER";
    performedBy: string;
    entityType: string;
    entityId: string;
    details?: string;
}) => {
    try {
        await AuditLogModel.create({
            action,
            performedBy,
            entityType,
            entityId,
            details,
        });
    } catch (err) {
        console.error("Audit log failed:", err);
    }
};
