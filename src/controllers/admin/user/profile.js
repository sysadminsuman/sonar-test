import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

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
    const userDetails = await adminService.userService.getByUserId(userId);
    if (!userDetails) throw StatusError.badRequest("userNotExists");

    res.status(200).send({
      user_id: userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
      customer_id: userDetails.customer_id,
      mobile: userDetails.mobile,
      profile_image_url: userDetails.profile_image,
    });
  } catch (error) {
    next(error);
  }
};
