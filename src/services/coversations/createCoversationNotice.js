import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation reactions data
export const createCoversationNotice = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_NOTICES_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
