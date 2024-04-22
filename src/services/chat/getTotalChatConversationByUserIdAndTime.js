import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get chat conversation by room
export const getTotalChatConversationByUserIdAndTime = async (params) => {
  let whereCondition = "";
  let parameters = [];
  parameters.push(params.userId);
  parameters.push(params.operator);
  parameters.push(params.searchDateTime);
  parameters.push(params.orderBy);
  const query = `SELECT c.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c INNER JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id WHERE cr.user_id = ? AND c.status = 'active' AND c.create_date ? ? AND cr.is_deleted = 'n' ${whereCondition} ORDER BY c.create_date ?`;

  const result = await executeQueryReader(query, parameters);
  return result;
};
