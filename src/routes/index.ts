import {Router} from "express";
import userRouter from "./user.routes";
import bookRoutes from "./book.routes";
import lendingRoutes from "./lending.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/book", bookRoutes)
rootRouter.use("/lending", lendingRoutes)

export default rootRouter;