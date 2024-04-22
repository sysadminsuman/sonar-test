import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get conversations details
export const getConversations = async (message_id) => {
  const query = `SELECT c.id, c.room_id, c.user_id, c.content_type, c.message, c.create_date, u.name,c.url_meta FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c JOIN ${TABLES.USER_TABLE} AS u ON c.user_id = u.id WHERE c.id = '${message_id}'`;

  const result = await executeQueryReader(query);
  return result[0];
};
