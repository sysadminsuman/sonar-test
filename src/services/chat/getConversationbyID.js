import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const getConversationbyID = async (id) => {
  const query = `SELECT emt.* FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS emt  WHERE emt.id = ? AND emt.status = 'active'`;
  const result = await executeQuery(query, id);
  return result[0];
};
