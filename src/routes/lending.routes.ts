
import express from "express";
import {
    getAllLendings,
    getLendingsByBook,
    getLendingsByReader,
    getOverdueLendings, getReturnedOverdueLendings,
    lendBook,
    returnBook
} from "../controllers/LendingController";

const router = express.Router();

router.post("/lend", lendBook);
router.put("/return/:id", returnBook);
router.get("/book/:isbn", getLendingsByBook);
router.get("/reader/:readerId", getLendingsByReader);
router.get("/overdue", getOverdueLendings);
router.get("/all",getAllLendings)
router.get("/returned", getReturnedOverdueLendings);

export default router;
