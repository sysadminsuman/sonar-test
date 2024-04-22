import { Router } from "express";
import { validateAdminAccessToken } from "../../middleware/index.js";
import { adminController } from "../../controllers/index.js";
import { adminValidation } from "../../validations/index.js";

const regionRouter = Router();

regionRouter.get(
  "/regions",
  validateAdminAccessToken,
  adminValidation.regionValidation.fetchRegionSearch,
  adminController.region.regionData,
);
regionRouter.get(
  "/region-list",
  validateAdminAccessToken,
  adminValidation.regionValidation.fetchRegionSearch,
  adminController.region.regionList,
);

regionRouter.get(
  "/popular-region-list",
  validateAdminAccessToken,
  adminController.region.popularRegionList,
);


export { regionRouter };
