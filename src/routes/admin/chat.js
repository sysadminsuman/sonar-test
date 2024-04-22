import { Router } from "express";
import { adminController } from "../../controllers/index.js";
import { validateApiKey, validateAdminAccessToken } from "../../middleware/index.js";
import { adminValidation } from "../../validations/index.js";
const chatRouter = Router();

chatRouter.get(
  "/all-chatrooms",
  validateApiKey,
  validateAdminAccessToken,
  adminValidation.chatValidation.chatroomsearchValidate,
  adminController.chat.searchChatroom,
);

chatRouter.get(
  "/popular-chatrooms",
  validateApiKey,
  validateAdminAccessToken,
  adminValidation.chatValidation.chatroomsearchValidate,
  adminController.chat.searchpopularChatroom,
);
chatRouter.get(
  "/chatroom-details/:room_id",
  validateApiKey,
  validateAdminAccessToken,
  adminValidation.chatValidation.chatroomDetailsValidate,
  adminController.chat.chatroomDetail,
);
chatRouter.get(
  "/chat-history",
  validateAdminAccessToken,
  adminValidation.chatValidation.getUserChatHistoryValidate,
  adminController.chat.getroomChatHistory,
);

chatRouter.get(
  "/download-all-chatrooms-excel",
  validateApiKey,
  validateAdminAccessToken,
  adminController.chat.downloadAllChatroomExcel,
);
chatRouter.get(
  "/chatroom-participant-list/:room_id",
  validateApiKey,
  validateAdminAccessToken,
  adminValidation.chatValidation.chatroomDetailsValidate,
  adminController.chat.chatroomParticipantList,
);
chatRouter.get(
  "/download-chatroom-participant/:room_id",
  validateApiKey,
  validateAdminAccessToken,
  adminValidation.chatValidation.chatroomDetailsValidate,
  adminController.chat.downloadChatroomParticipantList,
);
chatRouter.get(
  "/download-popular-chatrooms-excel",
  validateApiKey,
  validateAdminAccessToken,
  adminController.chat.downloadPopularChatroomExcel,
);
export { chatRouter };
