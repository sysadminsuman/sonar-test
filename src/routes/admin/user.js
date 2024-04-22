import { Router } from "express";
import { adminController } from "../../controllers/index.js";
import { validateApiKey, validateAdminAccessToken } from "../../middleware/index.js";
import { adminValidation } from "../../validations/index.js";
const userRouter = Router();

userRouter.post(
  "/login",
  validateApiKey,
  adminValidation.userValidation.adminLoginValidate,
  adminController.user.login,
);
userRouter.post(
  "/signup",
  validateApiKey,
  adminValidation.userValidation.adminSignupValidate,
  adminController.user.signup,
);

userRouter.get(
  "/user-approval-request-list",
  validateAdminAccessToken,
  adminController.user.getAllApprovalUserList,
);
userRouter.post(
  "/change-approval-request",
  validateAdminAccessToken,
  adminValidation.userValidation.userRequestValidate,
  adminController.user.updateuserRequest,
);
userRouter.get(
  "/users",
  validateApiKey,
  //adminValidation.userValidation.adminLoginValidate,
  adminController.user.getAllUser,
);
userRouter.get(
  "/profile-details/:user_id",
  validateAdminAccessToken,
  adminValidation.userValidation.userProfileValidate,
  adminController.user.profile,
);
userRouter.patch(
  "/users/:user_id",
  validateAdminAccessToken,
  adminValidation.userValidation.userUpdateValidate,
  adminController.user.userEdit,
);
userRouter.get(
  "/user-created-chatrooms/:id",
  validateAdminAccessToken,
  validateApiKey,
  adminValidation.userValidation.userChatValidate,
  adminController.user.getcreatedChatroomsOfUser,
);
userRouter.get(
  "/download-users-excel",
  validateApiKey,
  adminValidation.userValidation.userTypeValidate,
  adminController.user.downloadUserExcel,
);
userRouter.patch(
  "/password-update/:user_id",
  validateAdminAccessToken,
  adminValidation.userValidation.userPasswordUpdateValidate,
  adminController.user.userPasswordUpdate,
);
userRouter.post("/blocked-user", validateApiKey, adminController.user.blockedUser);

export { userRouter };
