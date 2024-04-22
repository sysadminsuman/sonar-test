import { Router } from "express";
import { validateAdminAccessToken } from "../../middleware/index.js";
import { adminController } from "../../controllers/index.js";
import { adminValidation } from "../../validations/index.js";

const reportRouter = Router();

reportRouter.get(
  "/report-user-list",
  validateAdminAccessToken,
  adminValidation.reportValidation.reportUserValidate,
  adminController.report.reportUser,
);
reportRouter.get(
  "/user-report-details/:room_id",
  validateAdminAccessToken,
  //adminValidation.reportValidation.reportMessageDetailsValidate,
  adminController.report.userReportDetails,
);
reportRouter.get(
  "/report-message-list",
  validateAdminAccessToken,
  adminValidation.reportValidation.reportMessageValidate,
  adminController.report.reportMessage,
);

reportRouter.get(
  "/report-message-details/:conversation_id",
  validateAdminAccessToken,
  adminValidation.reportValidation.reportMessageDetailsValidate,
  adminController.report.reportMessageDetails,
);

reportRouter.get(
  "/report-user-by-count",
  validateAdminAccessToken,
  adminValidation.reportValidation.reportUserByCountValidate,
  adminController.report.reportUserByCount,
);

reportRouter.get(
  "/report-user-by-count-details/:id",
  validateAdminAccessToken,
  adminValidation.reportValidation.reportUserByCountDetailsValidate,
  adminController.report.reportUserByCountDetails,
);

export { reportRouter };
