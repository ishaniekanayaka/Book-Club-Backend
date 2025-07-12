import {Router} from "express";
import {upload} from "../middlewares/upload";
import {signUp} from "../controllers/authController";

const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);

export default userRouter;