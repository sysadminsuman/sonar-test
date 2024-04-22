import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get parent conversations details
export const getParentConversations = async (parent_message_id) => {
  const query = `SELECT c.id, c.room_id, c.user_id, c.local_conversation_id, c.content_type, c.message, c.create_date, u.name FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c JOIN ${TABLES.USER_TABLE} AS u ON c.user_id = u.id WHERE c.local_conversation_id = '${parent_message_id}'`;

  const result = await executeQuery(query);
  return result[0];
};
