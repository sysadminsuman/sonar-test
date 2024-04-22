import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
export const getUserChatroomsByPagination = async (userId, offSet, limit, lastMessageID = 0) => {
  let whereQuery = "";
  let params = [];
  if (lastMessageID) {
    whereQuery = " AND lmt.latest_message_id < ?";
  }
  const lastmassagetimtbl = ` left join (SELECT max(create_date) as create_date,room_id,max(id) as latest_message_id
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE}
  where status = "active" group by room_id) as lmt on lmt.room_id = c.id `;
  const lastmassagetbl = ` left join (select IF( content_type = 'text',  message,  content_type) as latest_message, room_id
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE}
  where  id in
  (SELECT max(c.id)  
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as c
    join ht_chatroom_members as m on m.room_id=c.room_id 
  where c.status = "active" and m.status = "active"
  and c.create_date >= m.create_date and c.is_notice = 'n'
  and m.user_id = ?
  group by c.room_id)) as lm on lm.room_id = c.id `;
  const query = `SELECT c.id, c.room_unique_id, c.user_id, c.group_name, c.group_type, 
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",c.group_image)) as group_image,
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",c.group_image))) as group_image_medium,
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",c.group_image))) as group_image_small ,
  c.city, c.country, countUnreadChat(c.id, ?) as total_unread, lm.latest_message,lmt.latest_message_id, checkRoomOwnerByMemberId(c.id, ?) as owner, countActiveMemberByRoomID(c.id) as active_members, IFNULL(lmt.create_date,c.create_date) as latest_message_time FROM 
  ${TABLES.CHATROOMS_TABLE} AS c 
  INNER JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS cm ON c.id = cm.room_id 
  ${lastmassagetimtbl}
  ${lastmassagetbl}
  WHERE (c.status = 'active' OR c.is_moderator_left = 1)  AND cm.status = 'active' AND cm.user_id = ? ${whereQuery}
  ORDER BY latest_message_time DESC LIMIT ?, ?`;
  params.push(userId);
  params.push(userId);
  params.push(userId);
  params.push(userId);
  if (lastMessageID) {
    params.push(lastMessageID);
  }
  params.push(offSet);
  params.push(limit);
  const result = await executeQuery(query, params);
  /*const result = await executeQuery(query, params, function (err, rows) {
    console.log(this.sql);
    return rows;
  });*/
  return result;
};

export const getUserChatroomsByRoomID = async (userId, roomId) => {
  const lastmassagetimtbl = ` left join (SELECT max(create_date) as create_date,room_id
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE}
  where status = "active" group by room_id) as lmt on lmt.room_id = c.id `;
  const lastmassagetbl = ` left join (select IF( content_type = 'text',  message,  content_type) as latest_message, room_id
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE}
  where  id in
  (SELECT max(c.id)  
  FROM 
  ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as c
    join ht_chatroom_members as m on m.room_id=c.room_id 
  where c.status = "active" and m.status = "active"
  and c.create_date >= m.create_date and c.is_notice = 'n'
  and m.user_id = ?
  group by c.room_id)) as lm on lm.room_id = c.id `;
  const query = `SELECT c.id, c.room_unique_id, c.user_id, c.group_name, c.group_type, 
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",c.group_image)) as group_image,
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",c.group_image))) as group_image_medium,
  if(c.group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",c.group_image))) as group_image_small ,
  c.city, c.country, countUnreadChat(c.id, ?) as total_unread, lm.latest_message, checkRoomOwnerByMemberId(c.id, ?) as owner, countActiveMemberByRoomID(c.id) as active_members, IFNULL(lmt.create_date,c.create_date) as latest_message_time FROM 
  ${TABLES.CHATROOMS_TABLE} AS c 
  INNER JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS cm ON c.id = cm.room_id 
  ${lastmassagetimtbl}
  ${lastmassagetbl}
  WHERE c.status = 'active' AND cm.status = 'active' AND cm.user_id = ? AND c.id = ?`;
  const result = await executeQuery(query, [userId, userId, userId, userId, roomId]);
  return result[0];
};
