// routes/bookRoutes.ts
import express from "express";
import {addBook, deleteBook, getAllBooks, getBookById, restoreBook, updateBook} from "../controllers/bookController";
import { upload } from "../middlewares/upload"; // your multer/cloudinary config

const router = express.Router();

router.post("/", upload.single("profileImage"), addBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", upload.single("profileImage"), updateBook);
router.delete("/:id", deleteBook);
router.patch("/:id/restore", restoreBook);

export default router;
