import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
// get conversations details
export const getConversations = async (message_id) => {
  const MEMBERS = `(select id,user_id,room_id,status from ${TABLES.CHATROOM_MEMBERS_TABLE}
    where id in
    (SELECT max(id)  FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
     
    group by  user_id,room_id ))`;
  const query = `SELECT c.id, c.room_id, c.user_id, c.content_type,c.emoticon_item_id,c.message,c.url_meta, c.is_reported, c.create_date, u.name,u.profile_image,M.status as mstatus
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  JOIN ${TABLES.USER_TABLE} AS u ON c.user_id = u.id 
  JOIN ${MEMBERS} AS M ON M.user_id=c.user_id and M.room_id=c.room_id
  WHERE c.id = ?`;

  const result = await executeQuery(query, message_id);

  return result[0];
};
