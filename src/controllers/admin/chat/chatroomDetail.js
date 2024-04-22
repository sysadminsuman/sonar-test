import { adminService, chatMembersService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const chatroomDetail = async (req, res, next) => {
  try {
    const reqBody = req.params;

    let chatroomData = await adminService.chatService.getChatroomDetails(reqBody.room_id);
    let chatroom_status = "";
    if (chatroomData.passcode != "" && chatroomData.passcode != null) {
      const checkOwner = await chatMembersService.getChatroomMember(
        chatroomData.id,
        chatroomData.owner_user_id,
      );
      if (checkOwner) {
        chatroom_status = "active";
      } else {
        chatroom_status = "deleted";
      }
    }
    if (!chatroomData) throw StatusError.notFound("recordNotFound");

    let chatroom = {
      id: chatroomData.id,
      room_unique_id: chatroomData.room_unique_id,
      user_id: chatroomData.user_id,
      owner_user_id: chatroomData.owner_user_id,
      group_name: chatroomData.group_name,
      room_passcode: chatroomData.passcode,
      group_image: chatroomData.group_image,
      group_image_medium: chatroomData.group_image_medium,
      group_image_small: chatroomData.group_image_small,
      group_type: chatroomData.group_type,
      already_joined: chatroomData.owner === 0 ? false : true,
      day7convertations: chatroomData.day7convertations,
      latitude: chatroomData.latitude,
      longitude: chatroomData.longitude,
      country: chatroomData.country,
      city: chatroomData.city,
      address: chatroomData.address,
      create_date: chatroomData.create_date,
      room_users_count: chatroomData.active_members,
      area_radius: chatroomData.area_radius,
      passcode: chatroomData.passcode,
      is_passcode_protected: chatroomData.is_passcode_protected,
      moderator: chatroomData.moderator,
      active_members: chatroomData.active_members,
      url: chatroomData.url,
      latest_message_time: chatroomData.latest_message_time,
      status: chatroom_status ? chatroom_status : chatroomData.status,
    };
    return res.status(200).send({
      room_details: chatroom,
    });
  } catch (error) {
    next(error);
  }
};
