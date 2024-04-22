import { settingService, userDeviceService } from "../../services/index.js";
import { getCurrentTimeStamp, getCurrentDateTime } from "../../helpers/index.js";
import { SETTING_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";
/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const getSystemPopupSetting = async (req, res, next) => {
  try {
    const device_uuid = req.query.device_uuid;
    const currentTimeStamp = await getCurrentTimeStamp();
    const searchDateTime = await getCurrentDateTime();

    let message = "";
    let success = false;

    const setting = await settingService.getSettingByType(
      SETTING_TYPES.SYSTEM_POPUP,
      searchDateTime,
    );
    const setting_app_terimination = await settingService.getSettingByType(
      SETTING_TYPES.AAP_TERMINATION,
    );

    if (!setting) {
      message = res.__("Already Time Up");
    } else {
      const device_setting = await userDeviceService.getDeviceDetails(device_uuid);
      const system_popup_today_dt = dayjs(device_setting.system_popup_today_dt).format(
        "YYYY-MM-DD",
      );
      const currentDate = dayjs(searchDateTime).format("YYYY-MM-DD");

      //const system_popup_close_timestamp = dayjs(device_setting.system_popup_close_dt).valueOf();
      //const currentDateTimestamp = dayjs(searchDateTime).valueOf();
      //const start_maintenance_timestamp = dayjs(setting.start_maintenance).valueOf();

      if (device_setting.system_popup_today_dt && currentDate == system_popup_today_dt) {
        message = res.__("Already closed for Today");
        success = false;
      } else if (device_setting.system_popup_close_dt) {
        message = res.__("Already closed for this period");
        success = false;
      } else {
        message = setting.text;
        success = true;
      }
    }
    res.status(200).send({
      success: success,
      message: message,
      before_termination:
        setting_app_terimination && setting_app_terimination.before_termination == "y"
          ? true
          : false,
      before_termination_image:
        setting_app_terimination && setting_app_terimination.before_termination_image,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
