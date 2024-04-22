import { Router } from "express";
import { regionController } from "../controllers/index.js";
import { regionValidation } from "../validations/index.js";

const regionRouter = Router();

regionRouter.get("/regions", regionValidation.fetchRegionSearch, regionController.regionData);

export { regionRouter };
