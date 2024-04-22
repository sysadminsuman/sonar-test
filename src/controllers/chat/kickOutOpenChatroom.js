import { chatService, chatMembersService, conversationService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentUTCTime, getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const kickOutOpenChatroom = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const currentTimeStamp = await getCurrentTimeStamp();
    if (!reqBody.room_id) {
      throw StatusError.badRequest("invalidroomId");
    }
    const correntUTC = await getCurrentUTCTime();
    const chatMemberDetails = await chatMembersService.getChatroomMember(
      reqBody.room_id,
      reqBody.chat_member_id,
    );
    let roomData = await chatService.getChatroomDetails(reqBody.room_id);
    if (!roomData) throw StatusError.notFound("notFound");
    // prepare data for updation
    const updateMemberData = {
      is_kicked: "y",
      status: "deleted",
      updated_by: userId,
      update_date: correntUTC,
    };
    await chatMembersService.updateMember(updateMemberData, chatMemberDetails.id);

    // update the conversationTable when user is left
    const updateConversationData = {
      is_left: 1,
    };
    await conversationService.updateCoversationByUserID(
      updateConversationData,
      reqBody.room_id,
      reqBody.chat_member_id,
    );

    res.status(200).send({
      chatroom_member_id: chatMemberDetails.id,
      user_id: userId,
      chat_member_id: reqBody.chat_member_id,
      room_unique_id: roomData.room_unique_id,
      room_name: roomData.group_name,
      room_image_url: roomData.group_image,
      room_image_medium_url: roomData.group_image_medium,
      room_image_small_url: roomData.group_image_small,
      room_type: roomData.group_type,
      country: roomData.country,
      city: roomData.city,
      address: roomData.address,
      url: roomData.url,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
