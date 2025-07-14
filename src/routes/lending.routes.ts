import { Router } from "express";

import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/verifyAccessToken";
import {
    getLendingHistoryByBook,
    getLendingHistoryByReader,
    lendBook,
    returnBook
} from "../controllers/LendingController";

const router = Router();

router.post("/lend", authenticateToken, authorizeRoles("librarian", "staff"), lendBook);
router.put("/return/:lendingId", authenticateToken, authorizeRoles("librarian", "staff"), returnBook);
router.get("/history/book/:bookId", authenticateToken, getLendingHistoryByBook);
router.get("/history/reader/:readerId", authenticateToken, getLendingHistoryByReader);

export default router;
