import express from "express";
import { getAllAuditLogs } from "../controllers/auditController";

const router = express.Router();

router.get("/all", getAllAuditLogs);

export default router;
