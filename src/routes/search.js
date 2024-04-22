import { Router } from "express";
import { searchController } from "../controllers/index.js";
import { validateAccessToken } from "../middleware/index.js";
import { chatValidation } from "../validations/index.js";

const searchRouter = Router();

searchRouter.get("/chatrooms", searchController.searchChatroom);

searchRouter.get(
  "/not-participating-chatrooms",
  validateAccessToken,
  //chatValidation.searchNotParticipatingValidate,
  searchController.searchNotParticipatingChatrooms,
);

searchRouter.post(
  "/join-open-chatroom",
  validateAccessToken,
  chatValidation.joinOpenChatroomValidate,
  searchController.joinOpenChatroom,
);

export { searchRouter };
