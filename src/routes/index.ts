import {Router} from "express";
import userRouter from "./user.routes";
import bookRoutes from "./book.routes";
import lendingRoutes from "./lending.routes";
import readerRouter from "./reader.routes";
import auditRoutes from "./audit.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/book", bookRoutes)
rootRouter.use("/lending", lendingRoutes)
rootRouter.use("/reader", readerRouter)
rootRouter.use("/audit", auditRoutes)

export default rootRouter;