import { Router } from "express";
import { settingController } from "../controllers/index.js";
import { validateApiKey } from "../middleware/index.js";
import { settingValidation } from "../validations/index.js";

const settingRouter = Router();

settingRouter.get("/force-update-parking-setting", settingController.getForceUpdateSetting);
settingRouter.patch(
  "/force-update-parking-setting",
  validateApiKey,
  settingController.updateForceUpdateSetting,
);

settingRouter.get(
  "/system-popup-setting",
  settingValidation.getSystemPopupValidate,
  settingController.getSystemPopupSetting,
);
settingRouter.patch(
  "/system-popup-setting",
  validateApiKey,
  settingValidation.updatePopupSettingValidate,
  settingController.updatePopupSetting,
);

settingRouter.patch(
  "/app-parking-setting",
  validateApiKey,
  settingValidation.updateAppParkingSettingValidate,
  settingController.updateAppParkingSetting,
);

settingRouter.patch(
  "/close-system-popup/:uuid",
  validateApiKey,
  settingController.updateSystemPopupSetting,
);

settingRouter.patch(
  "/app-termination-setting",
  validateApiKey,
  settingController.updateAppTerminationSetting,
);

export { settingRouter };
