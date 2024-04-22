import { Router } from "express";
import { chatRouter } from "./chat.js";
const v870Router = Router();
v870Router.use("/chat", chatRouter);
export { v870Router };
