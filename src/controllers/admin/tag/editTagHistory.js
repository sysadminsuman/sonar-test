import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const editTagHistory = async (req, res, next) => {
  try {
    const reqBody = req.params;
    if (!reqBody.tagId) throw StatusError.notFound("invalidId");
    let tagData = await adminService.tagService.getTagHistoryById(reqBody.tagId);
    if (tagData.length === 0) throw StatusError.notFound("tagnotFound");

    return res.status(200).send({
      tag_details: tagData,
    });
  } catch (error) {
    next(error);
  }
};
