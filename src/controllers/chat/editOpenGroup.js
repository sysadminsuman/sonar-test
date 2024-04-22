//import bcrypt from "bcrypt";
import {
  chatService,
  conversationService,
  coversationRecipientService,
  chatMembersService,
} from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { GROUP_INFOS } from "../../utils/constants.js";
import { getCurrentUTCTime, getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const editOpenGroup = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const getId = req.params.room_id;
    const correntUTC = await getCurrentUTCTime();
    const currentTimeStamp = await getCurrentTimeStamp();
    if (!getId) {
      throw StatusError.badRequest("invalidroomId");
    }
    let chatroomData = await chatService.getChatroomDetails(getId);
    if (!chatroomData) throw StatusError.notFound("notFound");
    // prepare data for updation
    let data = {
      update_date: correntUTC,
    };
    if (reqBody.area_radius) {
      data["area_radius"] = reqBody.area_radius;
    }
    let message = "";
    let conversationId = 0;
    if (reqBody.passcode) {
      data["passcode"] = Buffer.from(reqBody.passcode).toString("base64"); //await bcrypt.hash(reqBody.passcode, envs.passwordSalt);
      data["is_secure_enable"] = "y";
      if (chatroomData.is_secure_enable == "n") {
        message = GROUP_INFOS.PASSWORD_SET;
      } else if (chatroomData.is_secure_enable == "y") {
        message = GROUP_INFOS.PASSWORD_CHANGED;
      }
    }
    if (reqBody.is_secure_enable && reqBody.is_secure_enable == "n") {
      data["is_secure_enable"] = "n";
      data["passcode"] = "";
      message = GROUP_INFOS.PASSWORD_REMOVE;
    }

    if (reqBody.passcode || reqBody.is_secure_enable == "n") {
      const insertMessageData = {
        user_id: userDetails.userId,
        room_id: getId,
        content_type: "info",
        message: message,
        create_date: correntUTC,
      };
      const memberList = await chatMembersService.getGroupMembersList(getId);
      if (memberList.length === 0) throw StatusError.badRequest("groupMemberNotExists");
      conversationId = await conversationService.createCoversation(insertMessageData);

      const insertRecipientsData = [];
      for (const member of memberList) {
        insertRecipientsData.push([member.id, conversationId, "y", correntUTC]);
      }
      await coversationRecipientService.createRecipients(insertRecipientsData);
    }
    await chatService.updateOpenGroup(data, getId);

    res.status(200).send({
      success: true,
      roomId: getId,
      area_radius: reqBody.area_radius ? reqBody.area_radius : 0,
      passcode: reqBody.passcode ? reqBody.passcode : "",
      conversation_id: conversationId,
      //is_secure_enable: (reqBody.is_secure_enable?reqBody.is_secure_enable:''),
      message: res.__("Chatroom-UpdateSuccessfull"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
