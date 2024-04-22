import { chatService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime, getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const notificationSetting = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const getId = req.params.room_id;
    const currentTimeStamp = await getCurrentTimeStamp();
    if (!getId) {
      throw StatusError.badRequest("invalidroomId");
    }
    // prepare data for updation
    let data = {
      update_date: await getCurrentDateTime(),
    };
    if (reqBody.is_enable_notification) {
      data["is_enable_notification"] = reqBody.is_enable_notification;
    }
    await chatService.updateNotificationSetting(data, getId, userId);
    res.status(200).send({
      success: true,
      roomId: getId,
      is_enable_notification: reqBody.is_enable_notification,
      message: res.__("Notification Setting Update Successfully"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
