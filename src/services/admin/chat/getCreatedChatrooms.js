import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";

export const getCreatedChatrooms = async (userId, searchParams) => {
  const name = searchParams.name;
  const memberType = searchParams.memberType;
  const chatroomType = searchParams.chatroomType;
  const privacyType = searchParams.privacyType;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  let params = [userId,userId,userId];
  let whereQuery = `WHERE c.status = 'active' AND cm.status = 'active' AND cm.user_id = ? `;
  
  // search keyword is "sw" for group_name search
  if (searchParams.name) {
    whereQuery += ` AND c.group_name like ? `;
    params.push(`%${name}%`);
  }
  if (memberType == "member" || memberType == "owner") {
    whereQuery += ` AND cm.member_type = ? `;
    params.push(memberType);
  }
  if (chatroomType == "general" || chatroomType == "location") {
    whereQuery += ` AND c.group_type = ? `;
    params.push(chatroomType);
  }
  if (privacyType == "everyone") {
    whereQuery += ` AND (c.passcode IS NULL OR c.passcode = "")`;
  }
  if (privacyType == "secret") {
    whereQuery += ` AND (c.passcode != "" AND c.passcode IS NOT NULL)`;
  }
  if (searchParams.startDate && !searchParams.endDate) {
    whereQuery += ' AND DATE(c.create_date) >= ?';
    params.push(startDate);
  }
  if (searchParams.startDate && searchParams.endDate) {
    whereQuery +=
      ' AND DATE(c.create_date) >= ? AND DATE(c.create_date) <=?';
      params.push(startDate);
      params.push(endDate);
  }
  if (!searchParams.startDate && searchParams.endDate) {
    whereQuery += ' AND DATE(c.create_date) <= ?';
    params.push(endDate);
  }
  const query = `SELECT c.id, c.room_unique_id, c.user_id, c.group_name, c.group_type, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
  c.city, c.country, countUnreadChat(c.id, ? ) as total_unread, getLatestMessageByRoomId(c.id)  as latest_message, checkRoomOwnerByMemberId(c.id, ?) as owner, countActiveMemberByRoomID(c.id)  as active_members, getLatestMessageTimeByRoomId(c.id) as latest_message_time FROM ${TABLES.CHATROOMS_TABLE} AS c INNER JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS   cm ON c.id = cm.room_id ${whereQuery}  ORDER BY cm.last_activity_date DESC`;
  
  const result = await executeQueryReader(query,params);

  return result;
};
