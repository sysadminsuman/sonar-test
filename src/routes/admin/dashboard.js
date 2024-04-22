import { Router } from "express";
import { validateAdminAccessToken } from "../../middleware/index.js";
import { adminController } from "../../controllers/index.js";
//import { adminValidation } from "../../validations/index.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  validateAdminAccessToken,
  //adminValidation.regionValidation.fetchRegionSearch,
  adminController.dashboard.dashboardData,
);

export { dashboardRouter };
