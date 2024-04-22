import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const getChatroomDetails = async (room_id, userId = 0) => {
  let params = [];
  let selectUserQuery = "";
  if (userId) {
    selectUserQuery = ", checkUserExistsInGroup(r.id, '?') as already_join";
    params.push(userId);
  }
  const LASTCONVERTATION = `( select max(create_date) last_activity ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE}  where status <> "deleted" and content_type <> 'info' and room_id = ? ) `;
  const query = `SELECT r.id, r.room_unique_id, r.user_id, r.group_name, 
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",r.group_image)) as group_image,
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",r.group_image))) as group_image_medium,
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",r.group_image))) as group_image_small ,
  r.group_type, r.latitude, r.longitude, r.country, r.city, r.address, r.area_radius, r.passcode,r.show_previous_chat_history, IF(r.passcode IS NULL OR r.passcode = '', false,true) as is_passcode_protected, r.url,r.is_secure_enable,countActiveMemberByRoomID(r.id) as active_members,IFNULL(c.last_activity, r.create_date)   as latest_message_time,r.create_date ${selectUserQuery} 
  FROM ${TABLES.CHATROOMS_TABLE} as r 
  left join ${LASTCONVERTATION} as c on c.room_id=r.id  
  WHERE r.id = ? and (r.status <> "deleted" OR r.is_moderator_left = 1)`;
  params.push(room_id);
  // if (userId) {
  //   params.push(userId);
  // }
  params.push(room_id);
  const result = await executeQueryReader(query, params);
  if (result) {
    return result[0];
  } else {
    return result;
  }
};

export const getChatroomDetailsByURL = async (room_unique_id, userId) => {
  const query = `SELECT id, room_unique_id, user_id, group_name, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
   group_type, latitude, longitude, country, city, address,is_secure_enable, area_radius, url,checkUserExistsInGroup(id, ? ) as already_join FROM ${TABLES.CHATROOMS_TABLE} WHERE room_unique_id = '?'`;

  const result = await executeQueryReader(query, [userId, room_unique_id]);
  return result[0];
};

export const getChatroomDetailsByID = async (room_id, userId = 0) => {
  let params = [];
  let selectUserQuery = "";
  if (userId) {
    selectUserQuery = ", checkUserExistsInGroup(r.id, '?') as already_join";
    params.push(userId);
  }
  const LASTCONVERTATION = `( select max(create_date) last_activity ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE}  where status <> "deleted" and content_type <> 'info' and room_id = ? ) `;
  const query = `SELECT r.id, r.room_unique_id, r.user_id, r.group_name, 
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",r.group_image)) as group_image,
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",r.group_image))) as group_image_medium,
  if(r.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",r.group_image))) as group_image_small ,
  r.group_type, r.latitude, r.longitude, r.country, r.city, r.address, r.area_radius, r.passcode,r.show_previous_chat_history, IF(r.passcode IS NULL OR r.passcode = '', false,true) as is_passcode_protected, r.url,r.is_secure_enable,countActiveMemberByRoomID(r.id) as active_members,IFNULL(c.last_activity, r.create_date)   as latest_message_time,r.create_date ${selectUserQuery} 
  FROM ${TABLES.CHATROOMS_TABLE} as r 
  left join ${LASTCONVERTATION} as c on c.room_id=r.id  
  WHERE r.id = ?`;
  params.push(room_id);
  // // if (userId) {
  //   params.push(userId);
  // //}
  params.push(room_id);
  const result = await executeQueryReader(query, params);

  if (result) {
    return result[0];
  } else {
    return result;
  }
};
