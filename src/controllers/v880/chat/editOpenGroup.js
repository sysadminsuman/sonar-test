//import bcrypt from "bcrypt";
import {
  chatService,
  conversationService,
  coversationRecipientService,
  chatMembersService,
  awsService,
} from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { GROUP_INFOS } from "../../../utils/constants.js";
import {
  getCurrentUTCTime,
  getCurrentTimeStamp,
  getRandomNumbers,
  getRandomRoomImage,
} from "../../../helpers/index.js";
import { envs } from "../../../config/index.js";
import sharp from "sharp";
const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const editOpenGroup = async (req, res, next) => {
  try {
    let reqBody = req.body;
    let room_file_name = "";
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

    if (req.file !== undefined) {
      room_file_name = req.file.key;
      let originalImageKey = "chatrooms/" + req.file.key;
      const originalImage = await s3
        .getObject({
          Bucket: BUCKET_NAME,
          Key: originalImageKey,
        })
        .promise();

      // Compress the image to 250x250
      const compressedImage250Promise = sharp(originalImage.Body)
        .toFormat("jpeg")
        .jpeg({
          force: true,
        })
        .resize({
          width: 250,
          withoutEnlargement: true,
        })
        .toBuffer();

      // Compress the image to 450x450
      const compressedImage450Promise = sharp(originalImage.Body)
        .toFormat("jpeg")
        .jpeg({
          force: true,
        })
        .resize({
          width: 450,
          withoutEnlargement: true,
        })
        .toBuffer();

      const [compressedImage250, compressedImage450] = await Promise.all([
        compressedImage250Promise,
        compressedImage450Promise,
      ]);

      // Upload the compressed images appropriate folders in the Compressed Images bucket
      const firstS3Upload = s3
        .putObject({
          Bucket: BUCKET_NAME,
          Key: "chatrooms/small/" + req.file.key,
          Body: compressedImage250,
          ContentType: "image",
          ACL: "public-read",
        })
        .promise();

      const secondS3Upload = s3
        .putObject({
          Bucket: BUCKET_NAME,
          Key: "chatrooms/medium/" + req.file.key,
          Body: compressedImage450,
          ContentType: "image",
          ACL: "public-read",
        })
        .promise();

      await Promise.all([firstS3Upload, secondS3Upload]);

      data["group_image"] = "/" + originalImageKey;
    } else if (reqBody.is_default_group_image && reqBody.is_default_group_image == "y") {
      const rndInt = getRandomNumbers(1, 10);
      data["group_image"] = await getRandomRoomImage(rndInt);
      room_file_name = data["group_image"].replace(/^.*[\\/]/, "");
    }

    await chatService.updateOpenGroup(data, getId);

    res.status(200).send({
      success: true,
      roomId: getId,
      area_radius: reqBody.area_radius ? reqBody.area_radius : 0,
      passcode: reqBody.passcode ? reqBody.passcode : "",
      conversation_id: conversationId,
      room_image: room_file_name ? envs.aws.cdnpath + data["group_image"] : "",
      room_image_medium: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/medium/" + room_file_name
        : "",
      room_image_small: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/small/" + room_file_name
        : "",
      message: res.__("Chatroom-UpdateSuccessfull"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
