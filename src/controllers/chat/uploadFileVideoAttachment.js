import jwt from "jsonwebtoken";
import i18n from "i18n";
import {
  getRandomNumbers,
  getCurrentUTCTime,
  //getCurrentTimeStamp,
  convertDateToMillisecond,
  //convertTimestampToDateTime,
  //getUserNameByUserId,
} from "../../helpers/index.js";
import {
  conversationService,
  coversationRecipientService,
  chatMembersService,
  chatService,
  userSocketsService,
  userService,
  pushNotificationService,
} from "../../services/index.js";
import { StatusError, envs } from "../../config/index.js";
import { GROUP_INFOS, NOTIFICATION_TYPES } from "../../utils/constants.js";
import dayjs from "dayjs";
import { io } from "socket.io-client";
/**
 * Upload File
 * @param req
 * @param res
 * @param next
 */
export const uploadFileVideoAttachment = async (req, res, next) => {
  try {
    const reqBody = req.body;
    // console.log(req.files);
    let attachments_original = [];
    for (let i = 0; i < req.files.length; i++) {
      const a = req.files[i].location.replace(envs.aws.imgpath, envs.aws.cdnpath);
      attachments_original.push(a);
    }

    res.status(200).send({
      acknowledgement: attachments_original,
      local_conversation_id: reqBody.local_conversation_id,
    });
  } catch (error) {
    next(error);
  }
};
