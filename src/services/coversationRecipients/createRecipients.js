import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Insert recipiants data
export const createRecipients = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} (user_id, conversation_id, has_read, create_date) VALUES ?`;
  await executeQuery(query, [data]);
};
