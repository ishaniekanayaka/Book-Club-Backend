import {Router} from "express";
import {upload} from "../middlewares/upload";
import {
    deleteUser,
    getAllUsers,
    getLoggedInUser,
    login,
    logout,
    refreshToken,
    signUp
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

export default userRouter;