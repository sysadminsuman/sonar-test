import { userService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";

/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const userEdit = async (req, res, next) => {
  try {
    const getId = req.params.user_id;

    const getUserById = await userService.getByUserId(getId);
    if (!getUserById) {
      throw StatusError.badRequest("invalidId");
    }

    const isExist = await userService.getByEmail(req.body.email);
    if (isExist && isExist.id != getId) {
      throw StatusError.badRequest("emailAlreadyExists");
    }
    const data = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      updated_by: req.userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    // data update
    await userService.updateUser(data, getId);

    res.status(200).send({
      user_id: getId,
      message: res.__("userUpdateSuccessfull"),
    });
  } catch (error) {
    //console.log(error);
    next(error);
  }
};
