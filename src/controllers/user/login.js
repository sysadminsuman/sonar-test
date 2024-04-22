//import bcrypt from "bcrypt";
import { userService } from "../../services/index.js";
import { envs } from "../../config/index.js";

import {
  getCurrentTimeStamp,
  getCurrentDateTime,
  getRandomUserImage,
  getRandomNumbers,
} from "../../helpers/index.js";

/**
 * User login by customer_id
 * @param req
 * @param res
 * @param next
 */
export const login = async (req, res, next) => {
  try {
    const reqBody = req.body;
    let userId = 0;
    const token = req.token;
    // get user details by login id
    const userDetails = await userService.getByCustomerID(reqBody.customer_id);
    if (userDetails && userDetails.is_withdrawal == 1) {
      //throw StatusError.badRequest("userNotExists");
      const upadate_user_data = {
        is_withdrawal: 0,
        status: "active",
      };
      await userService.updateUser(upadate_user_data, userDetails.id);
    }
    const rndInt = getRandomNumbers(1, 4);
    const default_profile_image = await getRandomUserImage(rndInt);
    const profile_image = reqBody.profile_image
      ? reqBody.profile_image
      : envs.aws.cdnpath + default_profile_image;
    if (!userDetails) {
      // prepare data for insertion
      const data = {
        customer_id: reqBody.customer_id,
        name: reqBody.name,
        profile_image: profile_image,
        default_profile_image: default_profile_image,
        is_overall_notification: reqBody.is_overall_notification
          ? reqBody.is_overall_notification
          : "y",
        is_room_creation_notification: reqBody.is_room_creation_notification
          ? reqBody.is_room_creation_notification
          : "y",
        is_logged_in: "y",
        is_location_enabled: reqBody.is_location_enabled ? reqBody.is_location_enabled : "y",
        create_date: await getCurrentDateTime(),
      };
      // data insertion
      userId = await userService.createUser(data);
    } else {
      const upadate_data = {
        name: reqBody.name,
        profile_image: profile_image,
        updated_by: userDetails.id,
        is_overall_notification: reqBody.is_overall_notification
          ? reqBody.is_overall_notification
          : "y",
        is_room_creation_notification: reqBody.is_room_creation_notification
          ? reqBody.is_room_creation_notification
          : "y",
        is_location_enabled: reqBody.is_location_enabled ? reqBody.is_location_enabled : "y",
        is_logged_in: "y",
        update_date: await getCurrentDateTime(),
      };
      // data update
      await userService.updateUser(upadate_data, userDetails.id);
      userId = userDetails.id;
    }

    // compare password
    /*const isSame = await bcrypt.compare(reqBody.login_password, userDetails.password);
    if (!isSame) throw StatusError.badRequest("invalidCredentials");*/

    // generate tokens and send
    //const result = await userService.generateTokens(reqBody.customer_id);
    const currentTimeStamp = await getCurrentTimeStamp();

    res.status(200).send({
      //...result,
      access_token: token,
      access_token_expiry: envs.jwt.accessToken.expiry,
      user_id: userId,
      name: reqBody.name,
      customer_id: reqBody.customer_id,
      is_overall_notification: reqBody.is_overall_notification
        ? reqBody.is_overall_notification
        : "y",
      is_room_creation_notification: reqBody.is_room_creation_notification
        ? reqBody.is_room_creation_notification
        : "y",
      is_location_enabled: reqBody.is_location_enabled ? reqBody.is_location_enabled : "y",
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
