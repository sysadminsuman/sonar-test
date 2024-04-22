import { Router } from "express";
import { settingRouter } from "./setting.js";
import { chatRouter } from "./chat.js";

const v2Router = Router();
// All routes go here
v2Router.use("/setting", settingRouter);
v2Router.use("/chat", chatRouter);

export { v2Router };
