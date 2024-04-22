import { settingService } from "../../services/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";

import dayjs from "dayjs";
import { StatusError } from "../../config/index.js";
/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const updateAppParkingSetting = async (req, res, next) => {
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

      data["text"] = reqBody.message;
    }
    // data update
    await settingService.updateSetting(data, 4);

    res.status(200).send({
      success: true,
      message: res.__("settingUpdateSuccessfull"),
      current_date: currentDate,
    });
  } catch (error) {
    next(error);
  }
};
