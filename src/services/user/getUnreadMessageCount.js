import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

/**
 *  get user details by either email or phone
 * @param userId
 */
export const getUnreadMessageCount = async (userId) => {
  const query = `SELECT count(DISTINCT c.id) AS unread_count FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
  left JOIN ${TABLES.CHATROOMS_TABLE} AS ch ON ch.id = c.room_id
  left JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS cm ON cm.room_id = ch.id
  WHERE cr.user_id = ? AND cm.user_id = ? AND c.status = 'active' AND ch.status = 'active' AND cm.status= 'active' AND c.content_type <> 'info' AND cr.has_read = 'n' AND cr.is_deleted = 'n'`;
  const result = await executeQueryReader(query, [userId, userId]);
  return result[0].unread_count;
};

export const getUnreadMessageCountByMultipleUser = async (userIds) => {
  const query = `SELECT cr.user_id, count(DISTINCT c.id) AS unread_count 
                   FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
                   LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
                   LEFT JOIN ${TABLES.CHATROOMS_TABLE} AS ch ON ch.id = c.room_id
                   LEFT JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS cm ON cm.room_id = ch.id
                   WHERE cr.user_id IN (?) AND cm.user_id IN (?) 
                   AND c.status = 'active' AND ch.status = 'active' 
                   AND cm.status= 'active' AND c.content_type <> 'info' 
                   AND cr.has_read = 'n' AND cr.is_deleted = 'n' 
                   GROUP BY cr.user_id`;
  const result = await executeQueryReader(query, [userIds, userIds]);
  const userUnreadCountList = {};
  for (const row of result) {
    userUnreadCountList[row["user_id"]] = row["unread_count"];
  }
  return userUnreadCountList;
};
