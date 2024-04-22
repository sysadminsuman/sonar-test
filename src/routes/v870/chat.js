import { Router } from "express";
import { validateAccessToken } from "../../middleware/index.js";
import { v870Validation } from "../../validations/index.js";
import { v870Controller } from "../../controllers/index.js";

const chatRouter = Router();

chatRouter.get(
  "/notice-list",
  validateAccessToken,
  v870Validation.chatValidation.getNoticeListValidate,
  v870Controller.chatController.getNoticeList,
);

export { chatRouter };
