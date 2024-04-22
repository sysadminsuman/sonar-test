import { Router } from "express";
import { userRouter } from "./user.js";
import { chatRouter } from "./chat.js";
import { tagRouter } from "./tag.js";
import { regionRouter } from "./region.js";
import { dashboardRouter } from "./dashboard.js";
import { statisticRouter } from "./statistics.js";
import { reportRouter } from "./report.js";

const v1AdminRouter = Router();
// All routes go here
v1AdminRouter.use("/user", userRouter);
v1AdminRouter.use("/chat", chatRouter);
v1AdminRouter.use("/tag", tagRouter);
v1AdminRouter.use("/region", regionRouter);
v1AdminRouter.use("/dashboard", dashboardRouter);
v1AdminRouter.use("/statistics", statisticRouter);
v1AdminRouter.use("/report", reportRouter);

export { v1AdminRouter };
