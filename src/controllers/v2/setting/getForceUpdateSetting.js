import { settingService, userDeviceService } from "../../../services/index.js";
import { getCurrentTimeStamp, getCurrentDateTime } from "../../../helpers/index.js";
import { SETTING_TYPES } from "../../../utils/constants.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const getForceUpdateSetting = async (req, res, next) => {
  try {
    const currentTimeStamp = await getCurrentTimeStamp();
    const setting = await settingService.getSettingByType(SETTING_TYPES.FORCE_UPDATE_POPUP);

    const system_setting = await settingService.getSettingByType(SETTING_TYPES.APP_PARKING);

    const setting_app_terimination = await settingService.getSettingByType(
      SETTING_TYPES.AAP_TERMINATION,
    );

    const reqQuery = req.query;
    if (reqQuery.device_uuid) {
      let data = {
        update_date: await getCurrentDateTime(),
      };
      data["latest_app_version"] = reqQuery.latest_app_version;
      await userDeviceService.updateDevice(data, reqQuery.device_uuid);
    }

    res.status(200).send({
      force_update: setting.force_update,
      android_latest_version: setting.android_latest_version,
      ios_latest_version: setting.ios_latest_version,
      app_parking: setting.app_parking,
      message: system_setting.text,
      after_termination:
        setting_app_terimination && setting_app_terimination.after_termination == "y"
          ? true
          : false,
      after_termination_image:
        setting_app_terimination && setting_app_terimination.after_termination_image,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
