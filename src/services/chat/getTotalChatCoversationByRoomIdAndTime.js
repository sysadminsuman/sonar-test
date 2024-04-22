import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get chat conversation by room
export const getTotalChatCoversationByRoomIdAndTime = async (params) => {
  let whereCondition = "";

  /*const query = `SELECT c.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c INNER JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id WHERE c.room_id = ${params.roomId} AND cr.user_id = ${params.userId} AND c.status = 'active' AND cr.is_deleted = 'n' ${whereCondition} ORDER BY c.create_date ${params.orderBy}`;*/
  let qparams = [
    params.roomId,
    params.userId,
    params.joindate,

    params.searchDateTime,
    params.orderBy,
  ];
  const query = `SELECT c.id 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE c.room_id = ?
  AND cr.user_id = ?
  AND c.status = 'active' 
  AND c.create_date >= ? 
  AND c.create_date ${params.operator} ? 
  AND cr.is_deleted = 'n' 
  ORDER BY c.create_date desc `;

  const result = await executeQueryReader(query, qparams);
  // console.log(result);
  return result;
};
