import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation data
export const reportCoversation = async (data) => {
  const query = `INSERT INTO ${TABLES.CONVERSATION_REPORTINGS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};

export const updateReportChatroomCoversation = async (data, id) => {
  const query = `UPDATE ${TABLES.CHATROOM_CONVERSATIONS_TABLE} SET ? WHERE id=?`;
  return await executeQuery(query, [data, id]);
};
