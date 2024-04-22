import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const getTagById = async (req, res, next) => {
  try {
    const reqBody = req.params;
    let tagData = await adminService.tagService.getTagById(reqBody.id);
    if (tagData.length === 0) throw StatusError.notFound("tagnotFound");

    return res.status(200).send({
      tag_details: tagData,
    });
  } catch (error) {
    next(error);
  }
};
