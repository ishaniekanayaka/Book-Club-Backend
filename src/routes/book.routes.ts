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
import {authenticateToken} from "../middlewares/authenticateToken";
import {authorizeRoles} from "../middlewares/verifyAccessToken";

const router = express.Router();

router.use(authenticateToken, authorizeRoles("librarian", "staff"));

router.post("/", upload.single("backCover"), addBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", upload.single("backCover"), updateBook);
router.delete("/:id", deleteBook);
router.get("/genres/list", getGenres);


export default router;
