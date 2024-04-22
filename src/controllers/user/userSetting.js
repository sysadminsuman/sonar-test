import { userService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const userSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    if (!userDetails) throw StatusError.badRequest("userNotExists");
    let data = {
      updated_by: userId,
      update_date: await getCurrentDateTime(),
    };
    if (reqBody.is_overall_notification) {
      data["is_overall_notification"] = reqBody.is_overall_notification;
    }
    if (reqBody.is_room_creation_notification) {
      data["is_room_creation_notification"] = reqBody.is_room_creation_notification;
    }
    if (reqBody.is_location_enabled) {
      data["is_location_enabled"] = reqBody.is_location_enabled;
    }
    // data update
    await userService.updateUser(data, userId);

    res.status(200).send({
      user_id: userId,
      message: res.__("userUpdateSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
