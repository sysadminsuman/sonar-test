import { Router } from "express";
import { v2Controller } from "../../controllers/index.js";

const settingRouter = Router();

settingRouter.get(
  "/force-update-parking-setting",
  v2Controller.settingController.getForceUpdateSetting,
);

export { settingRouter };
