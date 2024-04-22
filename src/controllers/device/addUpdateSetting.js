import { userDeviceService } from "../../services/index.js";
import { getCurrentDateTime, getCurrentTimeStamp } from "../../helpers/index.js";
import dayjs from "dayjs";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const addUpdateSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const deviceUuid = req.params.uuid;
    const deviceDetails = await userDeviceService.getDeviceDetails(deviceUuid);
    const currentTimeStamp = await getCurrentTimeStamp();

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
      message: res.__("NotificationSettingUpdateSuccessfully"),
      update_date: dayjs(deviceDetails.update_date).valueOf(),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
