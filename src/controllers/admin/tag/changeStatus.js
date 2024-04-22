import { adminService } from "../../../services/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";
import { StatusError } from "../../../config/index.js";
/**
 * Remove user device
 * @param req
 * @param res
 * @param next
 */
export const changeStatus = async (req, res, next) => {
  try {
    const tagId = req.body.id;
    if (!tagId) throw StatusError.badRequest("invalidId");

    const tagStatusCount = await adminService.tagService.getStatusCount();

    if (tagStatusCount == 10 && req.body.status == "active") {
      res.status(200).send({
        success: false,
        tag_id: tagId,
        show_status_count: tagStatusCount,
        message: res.__("Maximum tag are set. If you want to add new , remove old one"),
      });
    } else {
      const data = {
        status: req.body.status,
        updated_by: req.userDetails.userId,
        update_date: await getCurrentDateTime(),
      };

      // data delete
      const result = await adminService.tagService.updateTag(data, tagId);
      if (result) {
        //insert records for tag history
        const logData = {
          tag_id: tagId,
          name: req.body.name,
          status: req.body.status,
          updated_by: req.userDetails.userId,
          update_date: await getCurrentDateTime(),
        };
        await adminService.tagService.addTagHistory(logData);
      }
      const showStatusCount = await adminService.tagService.getStatusCount();

      res.status(200).send({
        success: true,
        tag_id: tagId,
        show_status_count: showStatusCount,
        message: res.__("statusChangedSuccessfully"),
      });
    }
  } catch (error) {
    next(error);
  }
};
