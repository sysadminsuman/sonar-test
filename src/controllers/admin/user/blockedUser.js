import { adminService } from "../../../services/index.js";
import { getCurrentDateTime, generateRandomPassword } from "../../../helpers/index.js";
import { envs } from "../../../config/index.js";
import bcrypt from "bcrypt";

import { emailService } from "../../../services/index.js";

/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const blockedUser = async (req, res, next) => {
  try {
    //const getId = req.params.user_id;
    const reqBody = req.body;
    let email = reqBody.login_user;
    const rndPassword = generateRandomPassword(8);

    // let email = "sourav.patra@divii.com";
    let type = "PASSWORD_SEND";
    let substitutions = { rndPassword };

    await emailService.sendEmail(email, type, substitutions);

    const data = {
      password: await bcrypt.hash(rndPassword, envs.passwordSalt),
      login_failure_count: 0,
      last_activity_date: await getCurrentDateTime(),
      update_date: await getCurrentDateTime(),
    };
    // data update
    await adminService.userService.updateBlockedUserPassword(data, email);

    res.status(200).send({
      user_name: email,
      message: res.__("userPasswordUpdateSuccessfull"),
    });
  } catch (error) {
    next(error);
  }
};
