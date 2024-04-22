import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get count for conversation chatroom
export const getCountUserLatestChatrooms = async (userId) => {
  const query = `SELECT c.id FROM ${TABLES.CHATROOMS_TABLE} AS c 
  INNER JOIN ${TABLES.CHATROOM_MEMBERS_TABLE} AS cm ON c.id = cm.room_id
  LEFT JOIN ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc ON c.id = cc.room_id 
  WHERE c.status = 'active' AND cm.status = 'active' AND cm.user_id = ? GROUP BY cm.room_id ORDER BY cc.create_date DESC`;
  const result = await executeQueryReader(query, userId);
  return result;
};
