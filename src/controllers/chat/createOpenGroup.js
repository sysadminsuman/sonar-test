import {
  chatService,
  tagService,
  regionService,
  awsService,
  userService,
  pushNotificationService,
  conversationService,
  coversationRecipientService,
} from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import {
  getCurrentDateTime,
  getCurrentUTCTime,
  getRandomRoomImage,
  getRandomNumbers,
} from "../../helpers/index.js";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL, NOTIFICATION_TYPES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
import sharp from "sharp";
const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;
/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const createOpenGroup = async (req, res, next) => {
  try {
    const reqBody = req.body;
    // process.exit();
    let room_file_name = "";
    const userDetails = req.userDetails;
    const roomUniqueId = uuidv4();
    // prepare data for insertion
    let data = {
      user_id: userDetails.userId,
      group_type: reqBody.group_type,
      room_unique_id: roomUniqueId,
      status: "active",
      create_date: await getCurrentDateTime(),
    };
    if (reqBody.group_type == "location") {
      data["latitude"] = reqBody.latitude;
      data["longitude"] = reqBody.longitude;
      data["address"] = reqBody.address ? reqBody.address : "";
      let cityResults = await regionService.getCityByIdsbyorder(reqBody.cities);
      if (cityResults) {
        data["city"] = cityResults.city_list;
        data["country"] = cityResults.country_list;
      }
      data["area_radius"] = reqBody.area_radius;
    } else {
      if (reqBody.cities) {
        let cityResults = await regionService.getCityByIdsbyorder(reqBody.cities);
        if (cityResults) {
          data["city"] = cityResults.city_list;
          data["country"] = cityResults.country_list;
          data["address"] = cityResults.city_list;
        }
      } else {
        data["city"] = "";
        data["country"] = "";
        data["address"] = "";
      }
    }
    data["url"] = BASE_URL + "api/v1/chat/roomURL/" + roomUniqueId;
    if (reqBody.tags && reqBody.tags.length > 0) {
      const tagName = await tagService.getTagsBySequenceIds(reqBody.tags);
      data["group_name"] = tagName;
    } else {
      const randTagName = await tagService.getRandomTag();
      //if (reqBody.cities && reqBody.group_type == "general") {
      if (reqBody.cities) {
        let cityDetailsResults = await regionService.getCityDetailsByIds(reqBody.cities);
        let groupName = "";
        if (cityDetailsResults) {
          if (reqBody.group_type == "location") {
            groupName += "#" + cityDetailsResults[0].country_name;
          }
          if (cityDetailsResults.length > 1) {
            groupName +=
              "#" + cityDetailsResults[0].name + "외" + (cityDetailsResults.length - 1) + "곳";
          } else {
            groupName += "#" + cityDetailsResults[0].name;
          }
        }
        data["group_name"] = groupName + "#" + randTagName;
      }
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
    } else {
      const rndInt = getRandomNumbers(1, 10);
      data["group_image"] = await getRandomRoomImage(rndInt);
      room_file_name = data["group_image"].replace(/^.*[\\/]/, "");
      //data["group_image"] = "";
    }

    if (reqBody.passcode) {
      //data["passcode"] = await bcrypt.hash(reqBody.passcode, envs.passwordSalt);
      data["passcode"] = Buffer.from(reqBody.passcode).toString("base64");
    }

    // data insertion for group creation
    const roomId = await chatService.createOpenGroup(data);

    if (!roomId) throw StatusError.badRequest("serverError");

    //if (reqBody.cities && reqBody.group_type == "general") {
    if (reqBody.cities) {
      for (let i = 0; i < reqBody.cities.length; i++) {
        let regionData = {
          room_id: roomId,
          city_id: reqBody.cities[i],
          created_by: userDetails.userId,
          status: "active",
          create_date: await getCurrentDateTime(),
        };
        await regionService.createChatroomRegion(regionData);
      }
    }

    if (reqBody.tags) {
      for (let i = 0; i < reqBody.tags.length; i++) {
        let tagData = {
          room_id: roomId,
          tag_id: reqBody.tags[i],
          created_by: userDetails.userId,
          status: "active",
          create_date: await getCurrentDateTime(),
        };
        await tagService.createChatroomTag(tagData);
      }
    }
    // prepare member data for insertion
    const member_data = {
      room_id: roomId,
      user_id: userDetails.userId,
      member_type: "owner",
      status: "active",
      created_by: userDetails.userId,
      create_date: await getCurrentDateTime(),
      last_activity_date: await getCurrentDateTime(),
    };
    // data insertion for member creation in a group
    await chatService.createGroupMember(member_data);
    const correntUTC = await getCurrentUTCTime();
    const insertMessageData = {
      user_id: userDetails.userId,
      room_id: roomId,
      content_type: "info",
      message: "chatroomCreated",
      create_date: correntUTC,
    };
    const conversationId = await conversationService.createCoversation(insertMessageData);

    const insertRecipientsData = [];

    insertRecipientsData.push([userDetails.userId, conversationId, "y", correntUTC]);

    await coversationRecipientService.createRecipients(insertRecipientsData);

    /* push notification for nearest user */
    if (reqBody.group_type == "location" && reqBody.passcode == "") {
      const memberList = await userService.getinRadious(
        reqBody.latitude,
        reqBody.longitude,
        reqBody.area_radius,
        userDetails.userId,
      );
      if (memberList.length > 0) {
        const notificationUserIds = [];
        for (const member of memberList) {
          notificationUserIds.push(member.id);
        }

        let notificationType = NOTIFICATION_TYPES.GROUP_CREATED;
        let senderData = { sender: userDetails.userId };
        pushNotificationService.sendNotification(
          notificationUserIds,
          notificationType,
          senderData,
          {
            room_id: roomId,
            room_name: data["group_name"],
            room_address: data["url"],
          },
        );
      }
    }
    /* end */
    res.status(200).send({
      user_id: userDetails.userId,
      room_unique_id: roomUniqueId,
      room_id: roomId,
      room_name: data["group_name"],
      room_url: data["url"],
      room_image: room_file_name ? envs.aws.cdnpath + data["group_image"] : "",
      room_image_medium: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/medium/" + room_file_name
        : "",
      room_image_small: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/small/" + room_file_name
        : "",
    });
  } catch (error) {
    next(error);
  }
};
