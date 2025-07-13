import {Router} from "express";
import userRouter from "./user.routes";
import bookRoutes from "./book.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/book", bookRoutes)

export default rootRouter;