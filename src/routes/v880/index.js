import { Router } from "express";
import { chatRouter } from "./chat.js";
const v880Router = Router();
v880Router.use("/chat", chatRouter);
export { v880Router };
