import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";

// get chat conversation by room
export const getTotalLatestChatCoversationByRoomIdAndTime = async (params) => {
  let whereCondition = "";
  //let qparams = [params.roomId, params.userId, params.joindate];
  let qparams = [params.roomId];
  if (params.searchDateTime) {
    whereCondition = ` AND c.create_date ${params.operator} ?`;
    qparams.push(params.searchDateTime);
  }

  if (params.show_previous_chat_history == "n") {
    whereCondition = ` AND c.create_date >= ?`;
    qparams.push(params.joindate);
  }

  if (params.unreadMsgCount && params.resultType == "first") {
    if (
      params.latest_unread_conversation_id > params.latest_read_conversation_id &&
      params.unreadMsgCount <= params.paginationLimit
    ) {
      whereCondition += ` AND c.id <= ? `;
      qparams.push(params.last_unread_conversation_id);
    } else {
      if (params.unreadMsgCount >= params.paginationLimit) {
        whereCondition += ` AND c.id >= ? `;
        qparams.push(params.latest_unread_conversation_id);
      } else {
        if (params.totalLastReadConversations >= params.paginationLimit) {
          whereCondition += ` AND c.id >= ? `;
          qparams.push(params.latest_unread_conversation_id);
        } else {
          whereCondition += ` AND c.id <=  ? `;
          qparams.push(params.last_unread_conversation_id);
        }
      }
    }
  }

  if (params.conversation_id) {
    whereCondition += ` AND c.id ${params.operator}  ? `;
    qparams.push(params.conversation_id);
  }

  /*const query = `SELECT c.id 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE c.room_id = ? 
  AND cr.user_id = ? 
  AND c.status = 'active' 
  AND c.create_date >= ?
  AND cr.is_deleted = 'n' ${whereCondition} 
  ORDER BY c.id ${params.orderBy}`;*/

  const query = `SELECT c.id 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  WHERE c.room_id = ?  
  AND c.status = 'active' ${whereCondition} 
  ORDER BY c.id ${params.orderBy}`;
  /*const result = await executeQuery(query, qparams, function (err, rows) {
    console.log(this.sql);
  });*/
  const result = await executeQuery(query, qparams);
  return result;
};
