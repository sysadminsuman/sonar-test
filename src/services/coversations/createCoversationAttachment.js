import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation attachments data
export const createCoversationAttachment = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
