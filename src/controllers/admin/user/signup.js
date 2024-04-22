import bcrypt from "bcrypt";
//import speakeasy from "speakeasy";
//import QRCode from "qrcode";
import { adminService, userService } from "../../../services/index.js";
import { StatusError, envs } from "../../../config/index.js";
import { getCurrentDateTime } from "../../../helpers/index.js";
import dayjs from "dayjs";

/**
 * User login
 * @param req
 * @param res
 * @param next
 */
export const signup = async (req, res, next) => {
  try {
    const reqBody = req.body;
    // check duplicate user exists by given email
    const isExists = await userService.getByEmail(reqBody.email);
    if (isExists) throw StatusError.badRequest("emailOrPhoneAlreadyExists");

    // prepare data for insertion
    const data = {
      product_no: reqBody.product_no,
      email: reqBody.email,
      password: await bcrypt.hash(reqBody.password, envs.passwordSalt),
      user_type: "super_admin",
      status: "inactive",
      create_date: await getCurrentDateTime(),
    };
    // data insertion
    const userId = await userService.createUser(data);

    // fetching inserted data history
    //const insertedDetails = await userService.getByEmail(reqBody.email);
    // generate tokens and send
    //const result = await userService.generateTokens(reqBody.email);

    /*res.status(200).send({
      ...result,
      user_id: userId,
      name: reqBody.name,
    });*/
    res.status(200).send({
      message: res.__("success"),
    });
  } catch (error) {
    next(error);
  }
};
