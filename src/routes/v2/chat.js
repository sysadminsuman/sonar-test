import { Router } from "express";
import { validateAccessToken, uploadChatroomImage, uploadFile } from "../../middleware/index.js";
import { v2Validation } from "../../validations/index.js";
import { v2Controller } from "../../controllers/index.js";

const chatRouter = Router();

chatRouter.get(
  "/check-chatroom-location",
  validateAccessToken,
  v2Validation.chatValidation.checkChatroomLocationValidate,
  v2Controller.chatController.checkChatroomLocation,
);

chatRouter.get(
  "/my-chatrooms",
  validateAccessToken,
  v2Validation.chatValidation.getUserAllChatroomValidate,
  v2Controller.chatController.getUserAllChatrooms,
);
chatRouter.post(
  "/chatroom",
  validateAccessToken,
  uploadChatroomImage,
  v2Validation.chatValidation.createOpenGroupValidate,
  v2Controller.chatController.createOpenGroup,
);
chatRouter.get(
  "/chatroom-details",
  v2Validation.chatValidation.chatroomDetailsValidate,
  v2Controller.chatController.chatroomDetail,
);
chatRouter.post(
  "/my-chatroom-details",
  validateAccessToken,
  v2Validation.chatValidation.myChatroomDetailsValidate,
  v2Controller.chatController.myChatroomDetail,
);
chatRouter.get(
  "/chatroom-media-list",
  validateAccessToken,
  v2Validation.chatValidation.getAllMediaValidate,
  v2Controller.chatController.getChatroomMedia,
);
chatRouter.post(
  "/attachment",
  validateAccessToken,
  v2Validation.chatValidation.fileValidate,
  uploadFile,
  v2Controller.chatController.uploadFile,
);

export { chatRouter };
