import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const searchMessageByPagination = async (room_id, searchKey, offSet, limit) => {
  // search keyword is "Sh" for message in a chatroom_conversations table search
  const query = `SELECT cc.id , cc.user_id , cc.message  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc WHERE cc.message LIKE '%${searchKey}%' AND cc.room_id = ${room_id} ORDER BY cc.message LIMIT ${offSet}, ${limit}`;
  const result = await executeQueryReader(query);
  return result;
};
