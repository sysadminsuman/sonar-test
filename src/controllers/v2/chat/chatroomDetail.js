import { chatService } from "../../../services/index.js";
//import { StatusError } from "../../config/index.js";
import dayjs from "dayjs";
import { getCurrentTimeStamp } from "../../../helpers/index.js";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const chatroomDetail = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const userId = reqBody.user_id ? reqBody.user_id : 0;
    let chatroomData = await chatService.getChatroomDetailsByID(reqBody.room_id, userId);
    //if (!chatroomData) throw StatusError.notFound("roomNotFound");
    const currentTimeStamp = await getCurrentTimeStamp();
    /*let diffMsg = "";
    let currentDateTime = await getCurrentDateTime();
    if (chatroomData.latest_message_time) {
      diffMsg = await getDateDifferenceString(currentDateTime, chatroomData.latest_message_time);
    }*/
    let chatroom = {
      id: chatroomData.id,
      room_unique_id: chatroomData.room_unique_id,
      room_name: chatroomData.group_name,
      room_image_url: chatroomData.group_image,
      room_image_medium_url: chatroomData.group_image_medium,
      room_image_small_url: chatroomData.group_image_small,
      room_type: chatroomData.group_type,
      latitude: chatroomData.latitude,
      longitude: chatroomData.longitude,
      country: chatroomData.country,
      city: chatroomData.city,
      address: chatroomData.address,
      room_users_count: chatroomData.active_members,
      room_recent_time: dayjs(chatroomData.latest_message_time).valueOf(),
      area_radius: chatroomData.area_radius,
      is_passcode_protected: chatroomData.is_passcode_protected,
      url: chatroomData.url,
      is_secure_enable: chatroomData.is_secure_enable,
      show_previous_chat_history: chatroomData.show_previous_chat_history,
    };

    if (userId) {
      chatroom["already_join"] = chatroomData.already_join;
    }
    chatroom["user_profile_image"] = await chatService.participantImages(reqBody.room_id);

    return res.status(200).send({
      room_details: chatroom,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
