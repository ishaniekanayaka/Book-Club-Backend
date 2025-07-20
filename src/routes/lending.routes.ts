// routes/lendingRoutes.ts
import express from "express";
import {
    getLendingsByBook,
    getLendingsByReader,
    getOverdueLendings,
    lendBook,
    returnBook
} from "../controllers/LendingController";


const router = express.Router();

router.post("/lend", lendBook);
router.put("/return/:id", returnBook);
router.get("/book/:bookId", getLendingsByBook);
router.get("/reader/:readerId", getLendingsByReader);
router.get("/overdue", getOverdueLendings);

export default router;
