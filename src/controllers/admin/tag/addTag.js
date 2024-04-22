import { getCurrentDateTime } from "../../../helpers/index.js";
import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
/**
 * insert tag list
 * @param req
 * @param res
 * @param next
 */
export const addTags = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    
    if (reqBody.name.indexOf("#") >0 ) throw StatusError.badRequest("invalidname");
    
    const isExists = await adminService.tagService.getByTagNameCount(reqBody.name);
    if (isExists) throw StatusError.badRequest("tagNameAlreadyExists");

    // prepare data for insertion
    const alldata = {
      name: reqBody.name,
      is_default: "y",
      status:"inactive",
      created_by: userDetails.userId,
      create_date: await getCurrentDateTime(),
      updated_by: userDetails.userId,
      update_date: await getCurrentDateTime(),
    };

    const id = await adminService.tagService.createTag(alldata);
    if (id) {
      //insert records for tag history
      const logData = {
        tag_id: id,
        name: reqBody.name,
        status:"inactive",
        updated_by: userDetails.userId,
        update_date: await getCurrentDateTime(),
      };
      await adminService.tagService.addTagHistory(logData);
      res.status(200).send({
        success: true,
        message: res.__("tagAdded"),
        result: { id: id, name: reqBody.name },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
