import { Router } from "express";
import { validateAccessToken, uploadChatroomImage } from "../../middleware/index.js";
import { v880Validation } from "../../validations/index.js";
import { v880Controller } from "../../controllers/index.js";

const chatRouter = Router();

chatRouter.patch(
  "/chatroom/:room_id",
  validateAccessToken,
  uploadChatroomImage,
  v880Validation.chatValidation.editOpenGroupValidate,
  v880Controller.chatController.editOpenGroup,
);
export { chatRouter };
