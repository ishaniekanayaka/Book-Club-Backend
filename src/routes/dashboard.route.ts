import express from "express";
import {
    getActiveLendings, getDashboardSummary,
    getOverdueBooks,
    getTotalBooks, getTotalLibrarian,
    getTotalReaders,
    getTotalStaff
} from "../controllers/dashboardController";


const router = express.Router();

router.get("/total-books", getTotalBooks);
router.get("/total-readers", getTotalReaders);
router.get("/total-staff", getTotalStaff);
router.get("/active-lendings", getActiveLendings);
router.get("/overdue-books", getOverdueBooks);
router.get("/total-librarian", getTotalLibrarian)
router.get("/all", getDashboardSummary)

export default router;
