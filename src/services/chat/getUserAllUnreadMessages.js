import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get all unread message by user in a particluar chatroom
export const getUserAllUnreadMessages = async (userId, roomId) => {
  const query = `SELECT c.*, cr.id as recipient_id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id WHERE c.room_id = ? AND cr.user_id = ? AND c.status = 'active' AND c.content_type <> 'info' AND cr.is_deleted = 'n' AND cr.has_read = 'n' ORDER BY c.create_date DESC`;
  const result = await executeQuery(query, [roomId, userId]);
  return result;
};
