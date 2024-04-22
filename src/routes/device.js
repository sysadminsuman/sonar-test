import { Router } from "express";

import { deviceController } from "../controllers/index.js";

import { validateAccessToken } from "../middleware/index.js";

import { deviceValidation } from "../validations/index.js";

const deviceRouter = Router();

deviceRouter.post(
  "/",
  validateAccessToken,
  deviceValidation.addDeviceValidate,
  deviceController.addUserDevice,
);

deviceRouter.delete("/:uuid", deviceController.deleteUserDevice);

deviceRouter.patch("/setting/:uuid", deviceController.addUpdateSetting);

deviceRouter.get("/:uuid", deviceController.getSetting);

deviceRouter.post("/user-device", deviceValidation.userDeviceValidate, deviceController.userDevice);

export { deviceRouter };
