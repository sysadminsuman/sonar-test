import { Router } from "express";
import { chatController } from "../controllers/index.js";
import { validateAccessToken, uploadFile, uploadChatroomImage } from "../middleware/index.js";
import { chatValidation } from "../validations/index.js";

const chatRouter = Router();

chatRouter.post(
  "/video-thumbnail-create",
  validateAccessToken,
  chatController.videoThumbnailCreate,
);

chatRouter.get(
  "/check-chatroom-location",
  validateAccessToken,
  chatValidation.checkChatroomLocationValidate,
  chatController.checkChatroomLocation,
);

chatRouter.post(
  "/chatroom",
  validateAccessToken,
  uploadChatroomImage,
  chatValidation.createOpenGroupValidate,
  chatController.createOpenGroup,
);

chatRouter.patch(
  "/chatroom/:room_id",
  validateAccessToken,
  chatValidation.editOpenGroupValidate,
  chatController.editOpenGroup,
);

chatRouter.post(
  "/join-chatroom",
  validateAccessToken,
  chatValidation.joinOpenChatroomValidate,
  chatController.joinOpenChatroom,
);

chatRouter.get(
  "/get-user-latest-chatrooms",
  //validateAccessToken,
  chatValidation.getUserLatestChatroomValidate,
  chatController.getUserLatestChatrooms,
);

chatRouter.get(
  "/my-chatrooms",
  validateAccessToken,
  chatValidation.getUserAllChatroomValidate,
  chatController.getUserAllChatrooms,
);

chatRouter.get(
  "/chat-history",
  validateAccessToken,
  chatValidation.getUserChatHistoryValidate,
  chatController.getUserChatHistory,
);

chatRouter.get(
  "/members/:room_id",
  validateAccessToken,
  chatValidation.getGroupMembersValidate,
  chatController.getGroupMembers,
);

//const cpUpload = uploadAttachment.fields([{ name: "attachments", maxCount: 5 }]);
chatRouter.post(
  "/attachment",
  validateAccessToken,
  chatValidation.fileValidate,
  uploadFile,
  chatController.uploadFile,
);

/* currently not used */
chatRouter.post(
  "/offline-message",
  validateAccessToken,
  chatValidation.offlineMessageValidate,
  chatController.saveOfflineMessage,
);

chatRouter.get(
  "/media",
  validateAccessToken,
  chatValidation.getAllMediaValidate,
  chatController.getAllMedia,
);

chatRouter.get(
  "/chatroom-media-list",
  validateAccessToken,
  chatValidation.getAllMediaValidate,
  chatController.getChatroomMedia,
);

chatRouter.get(
  "/chatroom-details",
  chatValidation.chatroomDetailsValidate,
  chatController.chatroomDetail,
);

chatRouter.post(
  "/my-chatroom-details",
  validateAccessToken,
  chatValidation.myChatroomDetailsValidate,
  chatController.myChatroomDetail,
);

chatRouter.post(
  "/passcode-verification",
  validateAccessToken,
  chatValidation.verifyPasscodeValidate,
  chatController.passcodeVerify,
);

chatRouter.get(
  "/room-url/:room_unique_id",
  validateAccessToken,
  chatValidation.roomURLValidate,
  chatController.roomURL,
);

chatRouter.patch(
  "/notification-setting/:room_id",
  validateAccessToken,
  chatValidation.notificationSettingValidate,
  chatController.notificationSetting,
);

chatRouter.get(
  "/user-profile-details/",
  validateAccessToken,
  chatValidation.userProfileDetailsValidate,
  chatController.userProfileDetails,
);

chatRouter.patch(
  "/kick-out-chatroom/",
  validateAccessToken,
  chatValidation.kickOutOpenChatroomValidate,
  chatController.kickOutOpenChatroom,
);

chatRouter.get("/emoticons/", validateAccessToken, chatController.getEmoticons);

chatRouter.post(
  "/report-message/",
  validateAccessToken,
  chatValidation.reportMessageValidate,
  chatController.reportMessage,
);

chatRouter.post(
  "/report-user/",
  validateAccessToken,
  chatValidation.reportUserValidate,
  chatController.reportUser,
);

chatRouter.get(
  "/chat-latest-history",
  validateAccessToken,
  chatValidation.getUserLatestChatHistoryValidate,
  chatController.getUserLatestChatHistory,
);

// chatRouter.get(
//   "/notice-list",
//   validateAccessToken,
//   chatValidation.getNoticeListValidate,
//   chatController.getNoticeList,
// );

export { chatRouter };
