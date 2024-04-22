import {
  conversationService,
  coversationRecipientService,
  chatMembersService,
  chatService,
} from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentUTCTime, getRandomNumbers } from "../../helpers/index.js";
import { USERLIST, ROOMLIST } from "../../utils/loadTesting.js";
import { GROUP_INFOS } from "../../utils/constants.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const leftOpenChatroom = async (req, res, next) => {
  try {
    const userInt = getRandomNumbers(1, 20);
    const rndInt = getRandomNumbers(1, 10);
    const room_id = ROOMLIST[rndInt];
    const userId = USERLIST[userInt];

    const [roomDetails, chatMemberDetails] = await Promise.all([
      chatService.getByRoomId(room_id),
      chatMembersService.getChatroomMember(room_id, userId),
    ]);
    if (!roomDetails) throw StatusError.badRequest("groupNotExists");
    if (!chatMemberDetails) throw StatusError.badRequest("memberNotExistsInRoom");

    const correntUTC = await getCurrentUTCTime();

    const is_owner = await chatMembersService.checkOwnerGroupMember(room_id, userId);

    const updateMemberData = {
      status: "deleted",
      member_type: "member",
      updated_by: userId,
      update_date: correntUTC,
    };
    await chatMembersService.updateMember(updateMemberData, chatMemberDetails.id);
    const memberList = await chatMembersService.getGroupMembersList(room_id);

    if (is_owner > 0) {
      let next_user_id = userId;

      if ((roomDetails.passcode == null || roomDetails.passcode == "") && memberList.length > 0) {
        const nextMemberData = await chatMembersService.getNextGroupMember(room_id);

        next_user_id = nextMemberData.user_id;
        const updateNextMemberData = {
          member_type: "owner",
          updated_by: userId,
          update_date: correntUTC,
        };
        await chatMembersService.updateMember(updateNextMemberData, nextMemberData.id);
      }

      const updateChatRoomData = {
        user_id: next_user_id,
        updated_by: userId,
        update_date: correntUTC,
      };
      await chatService.updateOpenGroup(updateChatRoomData, room_id);
    }

    const insertMessageData = {
      user_id: userId,
      room_id,
      content_type: "info",
      message: GROUP_INFOS.USER_LEFT,
      create_date: correntUTC,
    };
    const conversationId = await conversationService.createCoversation(insertMessageData);

    if (memberList.length > 0) {
      const insertRecipientsData = [];
      for (const member of memberList) {
        insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
      }
      await coversationRecipientService.createRecipients(insertRecipientsData);
    }

    // delete chatroom if last user leaving
    if (memberList.length == 0) {
      const updateObj = {
        status: "deleted",
      };
      await chatService.updateChatroom(updateObj, roomDetails.id);
    }

    res.status(200).send({
      user_id: userId,
      room_id: room_id,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
