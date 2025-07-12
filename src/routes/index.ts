import {Router} from "express";
import userRouter from "./user.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)

export default rootRouter;