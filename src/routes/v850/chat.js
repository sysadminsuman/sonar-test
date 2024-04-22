import { Router } from "express";
import { validateAccessToken } from "../../middleware/index.js";
import { v850Validation } from "../../validations/index.js";
import { v850Controller } from "../../controllers/index.js";

const chatRouter = Router();

chatRouter.get(
  "/chat-latest-history",
  validateAccessToken,
  v850Validation.chatValidation.getUserLatestChatHistoryValidate,
  v850Controller.chatController.getUserLatestChatHistory,
);
chatRouter.get(
  "/my-chatrooms",
  validateAccessToken,
  v850Validation.chatValidation.getUserAllChatroomValidate,
  v850Controller.chatController.getUserAllChatrooms,
);
export { chatRouter };
