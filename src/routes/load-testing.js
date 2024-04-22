import { Router } from "express";
import { demoController } from "../controllers/index.js";
import { uploadChatroomImage } from "../middleware/index.js";
//import { tagValidation } from "../validations/index.js";

const loadTestingRouter = Router();

loadTestingRouter.post("/send-message", demoController.sendMessage);

loadTestingRouter.get("/chat-history", demoController.getUserChatHistory);

loadTestingRouter.post("/chatroom", uploadChatroomImage, demoController.createOpenGroup);

loadTestingRouter.get("/my-chatrooms", demoController.getUserAllChatrooms);

loadTestingRouter.post("/left-chatroom/", demoController.leftOpenChatroom);

loadTestingRouter.get("/medialist", demoController.getAllMedia);

loadTestingRouter.post("/join-chatroom", demoController.joinOpenChatroom);

export { loadTestingRouter };
