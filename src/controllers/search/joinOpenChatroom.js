import { chatMembersService, chatService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import dayjs from "dayjs";
/**
 * User Join Open Chatroom
 * @param req
 * @param res
 * @param next
 */
export const joinOpenChatroom = async (req, res, next) => {
  try {
    const roomId = req.body.room_id;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const create_date = dayjs().format("YYYY-MM-DD HH:mm:ss");

    let roomData = await chatService.getChatroomDetails(roomId);

    if (!roomData) throw StatusError.notFound("notFound");

    // check duplicate userId exists
    const isExists = await chatMembersService.getChatroomMember(roomId, userId);
    if (isExists) throw StatusError.badRequest("memberAlreadyExists");

    // prepare data for insertion
    const data = {
      room_id: roomId,
      user_id: userId,
      member_type: "member",
      status: "active",
      created_by: userId,
      create_date: create_date,
    };
    // data insertion
    const chatroomMembersId = await chatMembersService.joinOpenChatroom(data);

    res.status(200).send({
      chatroom_member_id: chatroomMembersId,
      user_id: userId,
      room_id: roomId,
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
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
