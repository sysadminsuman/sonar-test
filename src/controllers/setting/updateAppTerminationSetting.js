import { settingService, pushNotificationService } from "../../services/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";
import { NOTIFICATION_TYPES, SETTING_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const updateAppTerminationSetting = async (req, res, next) => {
  try {
    const currentDate = dayjs(await getCurrentDateTime()).format("YYYY-MM-DD HH:mm");
    const setting_app_terimination = await settingService.getSettingByType(
      SETTING_TYPES.AAP_TERMINATION,
    );
    let data = {
      update_date: await getCurrentDateTime(),
    };
    data["after_termination"] = "y";
    await settingService.updateSetting(data, 6);

    /* push notification for app termination */
    let notificationType = NOTIFICATION_TYPES.AAP_TERMINATION;
    pushNotificationService.sendNotificationSetting(notificationType, {
      after_termination: "true",
      after_termination_image: setting_app_terimination.after_termination_image,
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
