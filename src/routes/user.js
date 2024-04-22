import { Router } from "express";
import { userController } from "../controllers/index.js";
import {
  validateAccessToken,
  validateApiKey,
  validateAccessTokenByLogin,
} from "../middleware/index.js";
import { userValidation } from "../validations/index.js";

const userRouter = Router();

userRouter.post("/signup", userValidation.userSignupValidate, userController.signup);

userRouter.post(
  "/login",
  validateAccessTokenByLogin,
  userValidation.userLoginValidate,
  userController.login,
);

userRouter.get(
  "/:user_id",
  validateAccessToken,
  userValidation.userProfileValidate,
  userController.profile,
);

userRouter.patch(
  "/:user_id",
  validateAccessToken,
  userValidation.userUpdateValidate,
  userController.userEdit,
);

userRouter.patch(
  "/geo-location/:user_id",
  validateAccessToken,
  userValidation.userGeoLocationValidate,
  userController.userGeoLocation,
);

userRouter.patch("/setting/:user_id", validateAccessToken, userController.userSetting);

userRouter.post(
  "/withdrawal",
  validateApiKey,
  userValidation.userWithdrawalValidate,
  userController.withdrawal,
);

userRouter.post(
  "/agreement",
  validateApiKey,
  userValidation.userAgreementValidate,
  userController.agreement,
);

userRouter.get(
  "/chatroom/unread-message-count",
  validateAccessTokenByLogin,
  userController.unreadMessageCount,
);

export { userRouter };
