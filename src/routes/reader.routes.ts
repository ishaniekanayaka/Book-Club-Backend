import { Router } from "express";
import { upload } from "../middlewares/upload"; // your multer setup
import { authenticateToken } from "../middlewares/authenticateToken";
import { authorizeRoles } from "../middlewares/verifyAccessToken";
import {
    createReader,
    deleteReader,
    getAllReaders,
    getReaderByMemberIdOrNIC,
    getReaderLogs,
    updateReader
} from "../controllers/readerController";


const readerRouter = Router();

readerRouter.post("/add", authenticateToken, authorizeRoles("staff", "librarian"), upload.single("profileImage"), createReader);
readerRouter.get("/all", authenticateToken, authorizeRoles("staff", "librarian"), getAllReaders);
readerRouter.put("/:id", authenticateToken, authorizeRoles("staff", "librarian"), upload.single("profileImage"), updateReader);
readerRouter.delete("/:id", authenticateToken, authorizeRoles("librarian"), deleteReader);
readerRouter.get("/:id/logs", getReaderLogs);
readerRouter.get("/search/:keyword", authenticateToken, authorizeRoles("staff", "librarian"), getReaderByMemberIdOrNIC);

export default readerRouter;
