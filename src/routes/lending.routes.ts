
import express from "express";
import {
    getAllLendings,
    getLendingsByBook,
    getLendingsByReader,
    getOverdueLendings, getReturnedOverdueLendings,
    lendBook,
    returnBook, sendOverdueNotifications
} from "../controllers/LendingController";
import {authenticateToken} from "../middlewares/authenticateToken";
import {authorizeRoles} from "../middlewares/verifyAccessToken";

const router = express.Router();
router.use(authenticateToken, authorizeRoles("staff", "librarian"))
router.post("/lend", lendBook);
router.put("/return/:id", returnBook);
router.get("/book/:isbn", getLendingsByBook);
router.get("/reader/:readerId", getLendingsByReader);
router.get("/overdue", getOverdueLendings);
router.get("/all",getAllLendings)
router.get("/returned", getReturnedOverdueLendings);
router.post("/notify-overdues", sendOverdueNotifications);

export default router;
