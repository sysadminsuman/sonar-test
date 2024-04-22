import {
  conversationService,
  coversationRecipientService,
  chatMembersService,
  chatService,
} from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { GROUP_INFOS } from "../../utils/constants.js";
import { getCurrentUTCTime, getCurrentTimeStamp, getRandomNumbers } from "../../helpers/index.js";
import { USERLIST, ROOMLIST } from "../../utils/loadTesting.js";
import dayjs from "dayjs";
/**
 * User Join Open Chatroom
 * @param req
 * @param res
 * @param next
 */

export const joinOpenChatroom = async (req, res, next) => {
  try {
    const rndInt = getRandomNumbers(1, 10);
    const roomId = ROOMLIST[rndInt];
    const userInt = getRandomNumbers(1, 20);
    const userId = USERLIST[userInt];
    const create_date = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const correntUTC = await getCurrentUTCTime();
    const currentTimeStamp = await getCurrentTimeStamp();
    let roomData = await chatService.getChatroomDetails(roomId);
    if (!roomData) throw StatusError.notFound("notFound");

    // check duplicate userId exists
    const isExists = await chatMembersService.getChatroomMember(roomId, userId);
    if (isExists) throw StatusError.badRequest("memberAlreadyExists");

    // check user is kicked or not
    const isKicked = await chatMembersService.getKickedChatroomMember(roomId, userId);
    if (isKicked) throw StatusError.badRequest("memberAlreadyKickedOut");

    // prepare data for insertion
    const data = {
      room_id: roomId,
      user_id: userId,
      member_type: "member",
      status: "active",
      created_by: userId,
      create_date: create_date,
      update_date: create_date,
      updated_by: userId,
      last_activity_date: create_date,
    };
    // data insertion

    const chatroomMembersId = await chatMembersService.joinOpenChatroom(data);

    const insertMessageData = {
      user_id: userId,
      room_id: roomId,
      content_type: "info",
      message: GROUP_INFOS.USER_JOIN,
      create_date: correntUTC,
    };
    const [memberList, conversationId] = await Promise.all([
      chatMembersService.getGroupMembersList(roomId),
      conversationService.createCoversation(insertMessageData),
    ]);
    if (memberList.length === 0) throw StatusError.badRequest("groupMemberNotExists");

    const insertRecipientsData = [];
    for (const member of memberList) {
      insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
    }
    await coversationRecipientService.createRecipients(insertRecipientsData);

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
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
