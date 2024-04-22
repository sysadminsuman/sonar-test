import { userService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const userGeoLocation = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    // get user details by user id
    const userDetails = await userService.getByUserId(userId);
    if (!userDetails) throw StatusError.badRequest("userNotExists");

    const data = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      address: req.body.address,
      updated_by: req.userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    // data update
    await userService.updateUser(data, userId);

    res.status(200).send({
      user_id: userId,
      message: res.__("locationUpdateSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
