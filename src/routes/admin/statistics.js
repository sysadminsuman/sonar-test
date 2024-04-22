import { Router } from "express";
import { validateAdminAccessToken } from "../../middleware/index.js";
import { adminController } from "../../controllers/index.js";
//import { adminValidation } from "../../validations/index.js";

const statisticRouter = Router();

statisticRouter.get(
  "/new-logins",
  validateAdminAccessToken,
  // adminValidation.tagValidation.tagAddValidate,
  adminController.statistics.newLoginGraph,
);
statisticRouter.get(
  "/new-chatrooms",
  validateAdminAccessToken,
  // adminValidation.tagValidation.tagAddValidate,
  adminController.statistics.newChatRoomGraph,
);

export { statisticRouter };
