import { adminService } from "../../../services/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";
/**
 * Remove user device
 * @param req
 * @param res
 * @param next
 */
export const deleteTag = async (req, res, next) => {
  try {
    const tagId = req.params.id;
    let tagData = await adminService.tagService.getTagById(req.params.id);
    
    if (!tagId) throw StatusError.badRequest("invalidId");
    const data = {
      status: "deleted",
      updated_by: req.userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    if (tagData.is_default =='n' ){
    // data delete
    await adminService.tagService.deleteuserTag(data, tagId);
    }
    else{
      await adminService.tagService.deleteTag(data, tagId);
    }
    res.status(200).send({
      success: true,
      tag_id: tagId,
      message: res.__("tagDeleteSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
