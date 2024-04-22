import { settingService, pushNotificationService } from "../../services/index.js";
import { getCurrentTimeStamp, getCurrentDateTime } from "../../helpers/index.js";
import { SETTING_TYPES, NOTIFICATION_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";
/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const appParking = async (req, res, next) => {
  try {
    const currentTimeStamp = await getCurrentTimeStamp();
    const searchDateTime = await getCurrentDateTime();

    let success = false;

    const setting = await settingService.getSettingByType(SETTING_TYPES.APP_PARKING);

    const currentDate = dayjs(searchDateTime).format("YYYY-MM-DD HH:mm");
    console.log(currentDate);

    const start_maintenance_dt = dayjs(setting.start_maintenance).format("YYYY-MM-DD HH:mm");
    const end_maintenance_dt = dayjs(setting.end_maintenance).format("YYYY-MM-DD HH:mm");

    if (currentDate == start_maintenance_dt) {
      let start_data = {
        app_parking: "y",
      };
      await settingService.updateSetting(start_data, 2);
      success = true;
      /* push notification for start system popup */
      let notificationType = NOTIFICATION_TYPES.APP_PARKING;
      pushNotificationService.sendNotificationSetting(notificationType, {
        message: setting.text,
        app_parking: "true",
      });
      /* end */
    }

    if (currentDate == end_maintenance_dt) {
      let end_data = {
        app_parking: "n",
      };
      await settingService.updateSetting(end_data, 2);
      success = true;
      /* push notification for end system popup */
      let notificationType = NOTIFICATION_TYPES.APP_PARKING;
      pushNotificationService.sendNotificationSetting(notificationType, {
        message: "",
        app_parking: "false",
      });
      /* end */
    }

    res.status(200).send({
      success: success,
      current_timestamp: currentTimeStamp,
      currentDate: currentDate,
    });
  } catch (error) {
    next(error);
  }
};
