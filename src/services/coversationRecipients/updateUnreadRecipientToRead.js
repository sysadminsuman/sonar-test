import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// read unread messages
export const updateUnreadRecipientToRead = async (data, message_id, user_id) => {
  const query = `UPDATE ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} SET ? WHERE user_id = ? AND conversation_id = ?`;

  await executeQuery(query, [data, user_id, message_id]);
};
