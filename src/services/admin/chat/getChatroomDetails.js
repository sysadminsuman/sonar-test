import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
export const getChatroomDetails = async (room_id) => {
  const query = `SELECT c.id, c.room_unique_id, c.user_id,u.id as owner_user_id, c.group_name, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
   c.group_type, c.latitude, c.longitude, c.country, c.city, c.address,c.create_date,c.status,c.area_radius,c.passcode, u.name as moderator ,IF(c.passcode IS NULL OR c.passcode = '', false,true) as is_passcode_protected, url,countActiveMemberByRoomID(c.id) as active_members, getLatestMessageTimeByRoomId(c.id) as latest_message_time FROM ${TABLES.CHATROOMS_TABLE} as c JOIN ${TABLES.USER_TABLE} as u on c.user_id=u.id WHERE c.id = ?`;

  const result = await executeQueryReader(query, room_id);
  return result[0];
};

export const getChatroomDetailsByURL = async (room_unique_id) => {
  const query = `SELECT c.id, c.room_unique_id, c.user_id, c.group_name, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
  c.group_type, c.latitude, c.longitude, c.country, c.city, c.address,c.create_date,c.status, c.area_radius, c.url,u.name as moderator FROM ${TABLES.CHATROOMS_TABLE} as c JOIN ${TABLES.USER_TABLE} as u on c.user_id=u.id WHERE c.room_unique_id = ?`;

  const result = await executeQueryReader(query, room_unique_id);
  return result[0];
};
