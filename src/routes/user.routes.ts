import {Router} from "express";
import {upload} from "../middlewares/upload";
import {
    deleteUser, getAllReaders, getAllStaff,
    getAllUsers,
    getLoggedInUser,
    login,
    logout,
    refreshToken,
    signUp, updateUser, updateUserRole
} from "../controllers/authController";
import {authenticateToken} from "../middlewares/authenticateToken";
import {authorizeRoles} from "../middlewares/verifyAccessToken";

const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/getAll",authenticateToken, getAllUsers);
userRouter.post("/login",login)
userRouter.get("/me",authenticateToken, getLoggedInUser);
userRouter.delete("/:id", authenticateToken, authorizeRoles("librarian"),deleteUser);
userRouter.post("/logout", logout);
userRouter.get("/refresh-token", refreshToken);
userRouter.get("/readers", authenticateToken, authorizeRoles("staff", "librarian"), getAllReaders);
userRouter.get("/staff", authenticateToken, authorizeRoles("staff", "librarian"), getAllStaff);
userRouter.put("/update/:id", authenticateToken,upload.single("profileImage"), authorizeRoles("admin", "librarian"), updateUser);
userRouter.put("/role/:id", authenticateToken, authorizeRoles("librarian"), updateUserRole);



export default userRouter;