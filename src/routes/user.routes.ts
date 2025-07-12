import {Router} from "express";
import {upload} from "../middlewares/upload";
import {getAllUsers, signUp} from "../controllers/authController";

const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/getAll", getAllUsers);

export default userRouter;