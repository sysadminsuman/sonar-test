import { Router } from "express";
import { validateAdminAccessToken } from "../../middleware/index.js";
import { adminController } from "../../controllers/index.js";
import { adminValidation } from "../../validations/index.js";

const tagRouter = Router();

tagRouter.post(
  "/tags",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagAddValidate,
  adminController.tag.addTags,
);

tagRouter.get(
  "/all-tags",
  validateAdminAccessToken,
  adminValidation.tagValidation.adminTagListValidate,
  adminController.tag.getTagList,
);
tagRouter.delete(
  "/tags/:id",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagDeleteValidate,
  adminController.tag.deleteTag,
);

tagRouter.patch(
  "/tags/:tagId",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagEditValidate,
  adminController.tag.editTag,
);

tagRouter.get(
  "/download-admin-tags/",
  // validateAdminAccessToken,
  adminValidation.tagValidation.adminTagListValidate,
  adminController.tag.downloadAdminTagExcel,
);

tagRouter.get("/tags-history/:tagId", validateAdminAccessToken, adminController.tag.editTagHistory);

tagRouter.get(
  "/users-tags",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagListValidate,
  adminController.tag.getUserTagList,
);

tagRouter.get(
  "/download-user-tags/",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagListValidate,
  adminController.tag.downloadUserTagExcel,
);

tagRouter.get(
  "/tag-details/:id",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagIdValidate,
  adminController.tag.getTagById,
);

tagRouter.get(
  "/tag-chatroom-list/:id",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagIdValidate,
  adminController.tag.getTagChatroomList,
);

tagRouter.get(
  "/download-tag-chatroom-list/:id",
  validateAdminAccessToken,
  adminValidation.tagValidation.tagIdValidate,
  adminController.tag.downloadUserTagChatroomListExcel,
);
tagRouter.post(
  "/change-status",
  validateAdminAccessToken,
  adminValidation.tagValidation.statusValidate,
  adminController.tag.changeStatus,
);

export { tagRouter };
