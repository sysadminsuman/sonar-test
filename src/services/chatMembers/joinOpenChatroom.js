import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Insert members details
export const joinOpenChatroom = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_MEMBERS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
