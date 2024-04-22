import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get chat history with search text
export const getUserAllRoomsChatHistoryByPagination = async (params) => {
  let whereCondition = "";
  let qparams = [params.userId, params.searchDateTime, params.offSet, params.paginationLimit];
  const query = `SELECT c.id, c.room_id, c.user_id, c.content_type,  c.message, c.create_date, cr.id as conversation_recipient_id,c.url_meta 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE cr.user_id = ? AND c.status = 'active' 
  AND c.create_date ${params.operator} ? AND cr.is_deleted = 'n' 
  ${whereCondition} ORDER BY c.create_date ${params.orderBy} 
  LIMIT ?, ? `;

  const result = await executeQueryReader(query, qparams);

  return result;
};
