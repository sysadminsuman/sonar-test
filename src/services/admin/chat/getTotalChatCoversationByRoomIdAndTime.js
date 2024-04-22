import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get chat conversation by room
export const getTotalChatCoversationByRoomIdAndTime = async (params) => {
  let whereCondition = "";
  let clauseParams = [];
  clauseParams.push(params.roomId);
  clauseParams.push(params.userId);
  clauseParams.push(params.operator);
  clauseParams.push(params.searchDateTime);
  clauseParams.push(params.orderBy);

  const query = `SELECT c.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  INNER JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE c.room_id = ? AND cr.user_id = ? 
  AND c.status = 'active' AND c.create_date ? ? 
  AND cr.is_deleted = 'n' ${whereCondition} ORDER BY c.create_date ?`;

  const result = await executeQueryReader(query, clauseParams);
  return result;
};

export const getTotalCountCoversationByRoomIdAndTime = async (roomId) => {
  const query = `SELECT count(c.id) as count FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c  WHERE c.room_id = ?  AND c.status = 'active' `;

  const result = await executeQueryReader(query, roomId);
  return result[0].count;
};
//Chatroom history with pagination
export const getTotalCountCoversationByRoomIdAndTimePagination = async (params) => {
  let clauseParams = [];
  clauseParams.push(params.roomId);
  clauseParams.push(params.offSet);
  clauseParams.push(params.paginationLimit);

  const query = `SELECT c.* ,u.name FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c LEFT JOIN ${TABLES.USER_TABLE} as u ON u.id = c.user_id WHERE c.room_id = ?  AND c.status = 'active' ORDER BY c.create_date desc LIMIT ?, ?`;

  const result = await executeQueryReader(query, clauseParams);
  return result;
};
