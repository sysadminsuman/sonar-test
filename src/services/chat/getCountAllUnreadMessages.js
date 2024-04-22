import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get count all unread message by message id
export const getCountAllUnreadMessages = async (message_id) => {
  const query = `SELECT COUNT(*) AS unread_count FROM ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} WHERE conversation_id = ? AND is_deleted = 'n' AND has_read = 'n'`;
  const result = await executeQuery(query, message_id);
  return result[0].unread_count;
};
