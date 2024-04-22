import { getCurrentDateTime } from "../../helpers/index.js";
import { tagService } from "../../services/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * insert tag list
 * @param req
 * @param res
 * @param next
 */
export const addtags = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const currentTimeStamp = await getCurrentTimeStamp();
    // prepare data for insertion
    const alldata = {
      name: reqBody.name,
      created_by: userDetails.userId,
      create_date: await getCurrentDateTime(),
      update_date: await getCurrentDateTime(),
      updated_by: userDetails.userId,
    };

    const id = await tagService.createTag(alldata);
    res.status(200).send({
      success: true,
      message: res.__("tagAdded"),
      result: { id: id, name: reqBody.name },
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
