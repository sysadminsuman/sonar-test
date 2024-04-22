import { userService } from "../services/index.js";
import { envs, StatusError } from "../config/index.js";
import { verifyTokenByclient } from "../helpers/index.js";

/**
 * This function is used for validating authorization header
 * @param req
 * @param res
 * @param next
 */
export const validateAccessToken = async (req, res, next) => {
  try {
    const token = req.token;
    if (!token) throw StatusError.forbidden("");

    // const decodedData = userService.verifyToken(token, envs.jwt.accessToken.secret);
    const decodedData = await verifyTokenByclient(token);

    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    //console.log(decoded);
    //process.exit();

    if (!decodedData) throw StatusError.unauthorized("");

    const userDetails = await userService.getByCustomerID(decoded.userNo);
    // console.log(userDetails);
    // process.exit();
    if (!userDetails) throw StatusError.unauthorized("");

    req["userDetails"] = {
      userId: userDetails.id,
      name: userDetails.name,
      customer_id: userDetails.customer_id,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const validateAccessTokenByLogin = async (req, res, next) => {
  try {
    const token = req.token;
    if (!token) throw StatusError.forbidden("");
    const decodedData = await verifyTokenByclient(token);
    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

    if (!decodedData) throw StatusError.unauthorized("");

    req["userDetails"] = {
      success: true,
      customer_id: decoded.userNo,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const validateAdminAccessToken = async (req, res, next) => {
  try {
    const token = req.token;
    if (!token) throw StatusError.forbidden("");

    const decodedData = userService.verifyToken(token, envs.jwt.accessToken.secret);
    if (!decodedData) throw StatusError.unauthorized("");

    const userDetails = await userService.getByEmailorPhone(decodedData.email);
    if (!userDetails) throw StatusError.unauthorized("");

    req["userDetails"] = {
      userId: userDetails.id,
      name: userDetails.name,
      email: userDetails.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};
