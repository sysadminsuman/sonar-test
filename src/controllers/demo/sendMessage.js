import { getCurrentUTCTime, getRandomNumbers } from "../../helpers/index.js";
//import { tagService } from "../../services/index.js";

import {
  conversationService,
  coversationRecipientService,
  chatMembersService,
} from "../../services/index.js";
import { USERLIST, ROOMLIST, MESSAGELIST } from "../../utils/loadTesting.js";
/**
 * insert tag list
 * @param req
 * @param res
 * @param next
 */
export const sendMessage = async (req, res, next) => {
  try {
    const rndInt = getRandomNumbers(1, 10);
    const message = MESSAGELIST[rndInt];
    const room_id = ROOMLIST[rndInt];
    const user_id = USERLIST[rndInt];
    const correntUTC = await getCurrentUTCTime();

    const data = {
      user_id,
      room_id,
      content_type: "text",
      message,
      create_date: correntUTC,
    };
    const conversation = await conversationService.createCoversation(data);
    const insertRecipientsData = [];

    const memberList = await chatMembersService.getGroupMembersList(room_id);
    for (const member of memberList) {
      if (member.id == user_id || member.is_online == "y") {
        insertRecipientsData.push([member.id, conversation, "y", correntUTC]);
      } else {
        insertRecipientsData.push([member.id, conversation, "n", correntUTC]);
      }
    }

    await Promise.all([
      coversationRecipientService.createRecipients(insertRecipientsData),
      // Updating last activity time
    ]);
    return res.status(200).send({
      last_conversation_id: conversation,
    });
  } catch (error) {
    next(error);
  }
};
