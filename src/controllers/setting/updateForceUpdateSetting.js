import { settingService, pushNotificationService } from "../../services/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";
/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const updateForceUpdateSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;

    let data = {
      update_date: await getCurrentDateTime(),
    };
    if (reqBody.android_latest_version) {
      data["android_latest_version"] = reqBody.android_latest_version;
    }
    if (reqBody.ios_latest_version) {
      data["ios_latest_version"] = reqBody.ios_latest_version;
    }
    if (reqBody.force_update) {
      data["force_update"] = reqBody.force_update;
    }
    /*if (reqBody.app_parking) {
      data["app_parking"] = reqBody.app_parking;
    }*/
    // data update
    await settingService.updateSetting(data, 2);

    /* push notification for force update */

    let notificationType = NOTIFICATION_TYPES.FORCE_UPDATE;
    pushNotificationService.sendNotificationSetting(notificationType, {
      android_latest_version: reqBody.android_latest_version,
      ios_latest_version: reqBody.ios_latest_version,
      force_update: reqBody.force_update,
    });

    /* end */

    res.status(200).send({
      success: true,
      message: res.__("settingUpdateSuccessfull"),
      force_update: reqBody.force_update,
      android_latest_version: reqBody.android_latest_version,
      ios_latest_version: reqBody.ios_latest_version,
    });
  } catch (error) {
    next(error);
  }
};
