import bcrypt from "bcrypt";
//import speakeasy from "speakeasy";
//import QRCode from "qrcode";
import { adminService } from "../../../services/index.js";
import { StatusError, envs } from "../../../config/index.js";
import { getDateDifference, getCurrentDateTime } from "../../../helpers/index.js";
import dayjs from "dayjs";

/**
 * User login
 * @param req
 * @param res
 * @param next
 */
export const login = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userType = "super_admin";

    let current_date = await getCurrentDateTime();

    // get user details by email
    const userDetails = await adminService.userService.getByEmail(reqBody.login_user, userType);
    if (!userDetails) throw StatusError.badRequest("invalidCredentials");
    // console.log(userDetails);
    if (userDetails.status == "inactive") throw StatusError.badRequest("accountNotActive");
    // compare password
    const isSame = await bcrypt.compare(reqBody.login_password, userDetails.password);

    const lastActivityDate = dayjs(userDetails.last_activity_date).format("YYYY-MM-DD");
    const currentDate = dayjs(current_date).format("YYYY-MM-DD");

    if (!isSame && currentDate === lastActivityDate) {
      const alldata = {
        login_failure_count: userDetails.login_failure_count + 1,
        last_activity_date: await getCurrentDateTime(),
      };
      const loginCount = await adminService.userService.getLoginCountUpdate(
        reqBody.login_user,
        alldata,
      );

      return res.status(400).send({
        success: false,
        login_failure_count: alldata.login_failure_count,
        message: res.__("invalidCredentials"),
      });
    } else if (!isSame && currentDate !== lastActivityDate) {
      const alldata = {
        login_failure_count: 1,
        last_activity_date: await getCurrentDateTime(),
      };
      const loginCount = await adminService.userService.getLoginCountUpdate(
        reqBody.login_user,
        alldata,
      );

      return res.status(400).send({
        success: false,
        login_failure_count: alldata.login_failure_count,
        message: res.__("invalidCredentials"),
      });
    } else if (isSame) {
      const alldata = {
        login_failure_count: 0,
        last_activity_date: await getCurrentDateTime(),
      };
      console.log(alldata);
      await adminService.userService.getLoginCountUpdate(reqBody.login_user, alldata);
    }

    // generate tokens and send
    const result = await adminService.userService.generateTokens(reqBody.login_user);

    res.status(200).send({
      ...result,
      user_id: userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
      login_failure_count: 0,
    });
  } catch (error) {
    next(error);
  }
};
