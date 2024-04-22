import { chatService, tagService, regionService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime, getRandomRoomImage, getRandomNumbers } from "../../helpers/index.js";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
import { USERLIST } from "../../utils/loadTesting.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const createOpenGroup = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userInt = getRandomNumbers(1, 20);
    const userId = USERLIST[userInt];

    //process.exit();
    let room_file_name = "";
    const roomUniqueId = uuidv4();
    // prepare data for insertion
    let data = {
      user_id: userId,
      group_type: reqBody.group_type,
      room_unique_id: roomUniqueId,
      status: "active",
      create_date: await getCurrentDateTime(),
    };

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

    data["url"] = BASE_URL + "api/v1/chat/roomURL/" + roomUniqueId;
    if (reqBody.tags && reqBody.tags.length > 0) {
      const tagName = await tagService.getTagsBySequenceIds(reqBody.tags);
      data["group_name"] = tagName;
    }

    const rndInt = getRandomNumbers(1, 10);
    data["group_image"] = await getRandomRoomImage(rndInt);
    room_file_name = data["group_image"];
    //data["group_image"] = "";

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
          created_by: userId,
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
          created_by: userId,
          status: "active",
          create_date: await getCurrentDateTime(),
        };
        await tagService.createChatroomTag(tagData);
      }
    }
    // prepare member data for insertion
    const member_data = {
      room_id: roomId,
      user_id: userId,
      member_type: "owner",
      status: "active",
      created_by: userId,
      create_date: await getCurrentDateTime(),
      last_activity_date: await getCurrentDateTime(),
    };
    // data insertion for member creation in a group
    await chatService.createGroupMember(member_data);

    res.status(200).send({
      user_id: userId,
      room_unique_id: roomUniqueId,
      room_id: roomId,
      room_name: data["group_name"],
      room_url: data["url"],
      room_image: room_file_name ? envs.aws.cdnpath + data["group_image"] : "",
      room_image_medium: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/medium" + room_file_name
        : "",
      room_image_small: room_file_name
        ? envs.aws.cdnpath + "/chatrooms/small" + room_file_name
        : "",
    });
  } catch (error) {
    next(error);
  }
};
