import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get chat history with search text
export const getUserChatHistoryByPagination = async (params) => {
  let whereCondition = "";

  const query = `SELECT c.id, c.room_id, c.user_id, c.parent_id, c.content_type, c.message,c.is_reaction, c.create_date, cr.id as conversation_recipient_id,c.url_meta FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id WHERE c.room_id = ${params.roomId} AND cr.user_id = ${params.userId} AND c.status = 'active' AND c.create_date ${params.operator} '${params.searchDateTime}' AND cr.is_deleted = 'n' ${whereCondition} ORDER BY c.create_date ${params.orderBy} LIMIT ${params.offSet}, ${params.paginationLimit}`;

  const result = await executeQueryReader(query);

  return result;
};
