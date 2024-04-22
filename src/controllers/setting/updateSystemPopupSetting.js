import { userDeviceService, settingService } from "../../services/index.js";
import { getCurrentDateTime, getCurrentTimeStamp } from "../../helpers/index.js";
import { SETTING_TYPES } from "../../utils/constants.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const updateSystemPopupSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const deviceUuid = req.params.uuid;
    const currentTimeStamp = await getCurrentTimeStamp();

    const close_type = reqBody.close_type;

    let data = {
      update_date: await getCurrentDateTime(),
    };
    if (close_type == "today") {
      data["system_popup_today_dt"] = await getCurrentDateTime();
    } else {
      const system_setting = await settingService.getSettingByType(SETTING_TYPES.SYSTEM_POPUP);
      data["system_popup_close_dt"] = system_setting.end_maintenance;
    }

    await userDeviceService.updateDevice(data, deviceUuid);

    res.status(200).send({
      uuid: deviceUuid,
      message: res.__("NotificationSettingUpdateSuccessfully"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
