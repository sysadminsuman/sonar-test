import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";
import { envs } from "../../../config/index.js";
import bcrypt from "bcrypt";

/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const userPasswordUpdate = async (req, res, next) => {
  try {
    const getId = req.params.user_id;
	const reqBody = req.body;
    const data = {
	password: await bcrypt.hash(reqBody.new_password, envs.passwordSalt),
      updated_by: req.userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    // data update
    await adminService.userService.updateUserPassword(data, getId);

    res.status(200).send({
      user_id: getId,
      message: res.__("userPasswordUpdateSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
