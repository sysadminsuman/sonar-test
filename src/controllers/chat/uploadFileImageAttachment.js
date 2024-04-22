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
export const uploadFileImageAttachment = async (req, res, next) => {
  try {
    const reqBody = req.body;
    // console.log(req.files);
    let attachments_original = [];
    let attachments_medium = [];
    let attachments_small = [];
    for (let i = 0; i < req.files.length; i++) {
      const a = req.files[i].original.Location.replace(envs.aws.imgpath, envs.aws.cdnpath);
      const b = req.files[i].medium.Location.replace(envs.aws.imgpath, envs.aws.cdnpath);
      const c = req.files[i].small.Location.replace(envs.aws.imgpath, envs.aws.cdnpath);
      attachments_original.push(a);
      attachments_medium.push(b);
      attachments_small.push(c);
    }

    res.status(200).send({
      acknowledgement: attachments_original,
      acknowledgement_medium: attachments_medium,
      acknowledgement_small: attachments_small,
      local_conversation_id: reqBody.local_conversation_id,
    });
  } catch (error) {
    next(error);
  }
};
