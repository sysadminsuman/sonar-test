import { userService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const profile = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    // get user details by user id
    const userDetails = await userService.getByUserId(userId);
    if (!userDetails) throw StatusError.badRequest("userNotExists");
    const currentTimeStamp = await getCurrentTimeStamp();

    res.status(200).send({
      user_id: userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
      mobile: userDetails.mobile,
      profile_image_url: userDetails.profile_image,
      is_overall_notification: userDetails.is_overall_notification,
      is_room_creation_notification: userDetails.is_room_creation_notification,
      is_location_enabled: userDetails.is_location_enabled,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
