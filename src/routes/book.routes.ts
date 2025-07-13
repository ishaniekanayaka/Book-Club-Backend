// routes/bookRoutes.ts
import express from "express";
import {
    addBook,
    deleteBook,
    getAllBooks,
    getBookById,
    getGenres,
    updateBook
} from "../controllers/bookController";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.post("/", upload.single("profileImage"), addBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", upload.single("profileImage"), updateBook);
router.delete("/:id", deleteBook);

router.get("/genres/list", getGenres);


export default router;
