import { Router } from "express";
import { chatRouter } from "./chat.js";
const v850Router = Router();
v850Router.use("/chat", chatRouter);
export { v850Router };
