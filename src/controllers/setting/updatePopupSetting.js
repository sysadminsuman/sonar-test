import {
  settingService,
  pushNotificationService,
  userDeviceService,
} from "../../services/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";
import { StatusError } from "../../config/index.js";
/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const updatePopupSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const currentDate = dayjs(await getCurrentDateTime()).format("YYYY-MM-DD HH:mm");
    if (dayjs(reqBody.start_maintenance).valueOf() >= dayjs(reqBody.end_maintenance).valueOf()) {
      throw StatusError.badRequest("inValidDate");
    }

    let data = {
      update_date: await getCurrentDateTime(),
    };

    if (reqBody.start_maintenance && reqBody.end_maintenance) {
      data["start_maintenance"] = reqBody.start_maintenance;
      data["end_maintenance"] = reqBody.end_maintenance;

      /*let local_start_maintenance_dt = await getLocalTimeByTimezone(data["start_maintenance"]);
      let local_end_maintenance_dt = await getLocalTimeByTimezone(data["end_maintenance"]);

      let start_maintenance_dt = new Date(local_start_maintenance_dt);
      let end_maintenance_dt = new Date(local_end_maintenance_dt);*/

      /*data["text"] =
        dayjs(start_maintenance_dt).format("YYYY.M.D(금) HH:mm") +
        "~" +
        dayjs(end_maintenance_dt).format("M.D(금) HH:mm");
      let diffHour = await getDateDifferenceHours(end_maintenance_dt, start_maintenance_dt);

      data["duration_text"] = "(약 " + diffHour + " 예상)";*/
      data["text"] = reqBody.message;
    }
    // data update
    await settingService.updateSetting(data, 3);

    await userDeviceService.updateAllDevice();

    /* push notification for system popup */
    let notificationType = NOTIFICATION_TYPES.SYSTEM_POPUP;
    pushNotificationService.sendNotificationSystemSetting(notificationType, {
      message: data["text"],
    });

    /* end */

    res.status(200).send({
      success: true,
      message: res.__("settingUpdateSuccessfull"),
      current_date: currentDate,
    });
  } catch (error) {
    next(error);
  }
};
