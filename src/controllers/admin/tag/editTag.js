import { getCurrentDateTime } from "../../../helpers/index.js";
import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
/**
 * insert tag list
 * @param req
 * @param res
 * @param next
 */
export const editTag = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const getId = req.params.tagId;
    if (!getId) {
      throw StatusError.badRequest("invalidId");
    }
    if (reqBody.name.indexOf("#") >0 ) throw StatusError.badRequest("invalidname");
    // prepare data for insertion
    const alldata = {
      id: req.params.tagId,
      name: reqBody.name,
      created_by: userDetails.userId,
      create_date: await getCurrentDateTime(),
      updated_by: userDetails.userId,
      update_date: await getCurrentDateTime(),
    };

    // data update
    const result = await adminService.tagService.updateTag(alldata, getId);
    if (result) {
      //insert records for tag history
      const logData = {
        tag_id: getId,
        name: reqBody.name,
        status: reqBody.status,
        updated_by: userDetails.userId,
        update_date: await getCurrentDateTime(),
      };
      await adminService.tagService.addTagHistory(logData);
      res.status(200).send({
        success: true,
        tagId: getId,
        message: res.__("tagUpdateSuccessfull"),
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
