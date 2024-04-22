import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";

/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const updateuserRequest = async (req, res, next) => {
  try {
    const getId = req.body.user_id;

    const getUserById = await adminService.userService.getByUserId(getId);
    if (!getUserById) {
      throw StatusError.badRequest("invalidId");
    }

    const data = {
      status: req.body.status == 1 ? "active" : "deleted",
      updated_by: req.userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    // data update
    await adminService.userService.updateUser(data, getId);

    res.status(200).send({
      user_id: getId,
      message: res.__("userUpdateSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
