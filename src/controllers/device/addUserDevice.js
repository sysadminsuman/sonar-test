import { userDeviceService } from "../../services/index.js";

/**
 * Add user device
 * @param req
 * @param res
 * @param next
 */
export const addUserDevice = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userDetails = req.userDetails;

    const insertDeviceData = {
      user_id: userDetails.userId,
      device_uuid: reqBody.device_uuid,
      device_type: reqBody.device_type,
      device_token: reqBody.device_token,
    };
    // Upsert device data
    await userDeviceService.insertOrUpdateDevice(insertDeviceData);

    res.status(200).send({ success: true });
  } catch (error) {
    next(error);
  }
};
