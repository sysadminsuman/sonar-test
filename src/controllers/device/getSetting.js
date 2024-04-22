import { userDeviceService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const getSetting = async (req, res, next) => {
  try {
    const deviceUuid = req.params.uuid;

    // get user details by user id
    const deviceDetails = await userDeviceService.getDeviceDetails(deviceUuid);
    if (!deviceDetails) throw StatusError.badRequest("notFound");
    const currentTimeStamp = await getCurrentTimeStamp();

    res.status(200).send({
      device_uuid: deviceDetails.device_uuid,
      is_overall_notification: deviceDetails.is_overall_notification,
      is_room_creation_notification: deviceDetails.is_room_creation_notification,
      is_location_enabled: deviceDetails.is_location_enabled,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
