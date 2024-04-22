import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";

/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const userEdit = async (req, res, next) => {
  try {
    const getId = req.params.user_id;

    const getUserById = await adminService.userService.getByUserId(getId);
    if (!getUserById) {
      throw StatusError.badRequest("invalidId");
    }

    const isExist = await adminService.userService.getByEmail(req.body.email);
    if (isExist && isExist.id != getId) {
      throw StatusError.badRequest("emailAlreadyExists");
    }
    const data = {
      name: req.body.name,
      email: req.body.email,
      customer_id: req.body.customer_id,
      //mobile: req.body.mobile,
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
