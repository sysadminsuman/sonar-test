import { userDeviceService } from "../../services/index.js";
import { getCurrentDateTime, getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * Add user device
 * @param req
 * @param res
 * @param next
 */
export const userDevice = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const currentTimeStamp = await getCurrentTimeStamp();
    if (reqBody.user_id) {
      const insertDeviceData = {
        user_id: reqBody.user_id,
        device_uuid: reqBody.device_uuid,
        device_type: reqBody.device_type,
        device_token: reqBody.device_token,
      };
      // Upsert device data
      await userDeviceService.insertOrUpdateDevice(insertDeviceData);
    }

    const deviceUuid = reqBody.device_uuid;
    const deviceDetails = await userDeviceService.getDeviceDetails(deviceUuid);
    let data = {
      create_date: await getCurrentDateTime(),
    };
    if (reqBody.is_overall_notification) {
      data["is_overall_notification"] = reqBody.is_overall_notification;
    }
    if (reqBody.is_room_creation_notification) {
      data["is_room_creation_notification"] = reqBody.is_room_creation_notification;
    }
    if (reqBody.is_location_enabled) {
      data["is_location_enabled"] = reqBody.is_location_enabled;
    }
    if (reqBody.is_logged_in) {
      data["is_logged_in"] = reqBody.is_logged_in;
    }
    if (deviceDetails === 0) {
      // data update
      data["device_uuid"] = deviceUuid;
      data["device_token"] = reqBody.device_token;
      data["device_type"] = reqBody.device_type;
      await userDeviceService.insertDevice(data);
    } else {
      data["update_date"] = await getCurrentDateTime();
      data["device_token"] = reqBody.device_token;
      data["device_type"] = reqBody.device_type;
      await userDeviceService.updateDevice(data, deviceUuid);
    }

    res.status(200).send({
      uuid: deviceUuid,
      success: true,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
