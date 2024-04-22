import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation data
export const createCoversation = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_CONVERSATIONS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
