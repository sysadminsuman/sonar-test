import { chatService, chatMembersService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { getCurrentTimeStamp } from "../../../helpers/index.js";
import dayjs from "dayjs";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const myChatroomDetail = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userDetails = req.userDetails;
    const currentTimeStamp = await getCurrentTimeStamp();
    let chatroomData = await chatService.getChatroomDetails(reqBody.room_id);

    if (!chatroomData) throw StatusError.notFound("notFound");

    /*let diffMsg = "";
    let currentDateTime = await getCurrentDateTime();
    if (chatroomData.latest_message_time) {
      diffMsg = await getDateDifferenceString(currentDateTime, chatroomData.latest_message_time);
    }*/

    const isExists = await chatMembersService.getChatroomMember(
      reqBody.room_id,
      userDetails.userId,
    );
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
      is_owner:
        isExists && isExists.member_type == "owner" && isExists.status == "active" ? true : false,
      //is_secure_enable: chatroomData.is_secure_enable,
      //passcode_test: chatroomData.passcode,//Need to remove
      passcode:
        isExists && isExists.member_type == "owner" && isExists.status == "active"
          ? Buffer.from(
              chatroomData.passcode == null ? "" : chatroomData.passcode,
              "base64",
            ).toString("ascii")
          : "",
      room_create_date: dayjs(chatroomData.create_date).valueOf(),
      show_previous_chat_history: chatroomData.show_previous_chat_history,
    };

    chatroom["user_profile_image"] = await chatService.participantImages(reqBody.room_id);

    return res.status(200).send({
      room_details: chatroom,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
