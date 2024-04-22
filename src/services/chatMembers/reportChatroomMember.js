import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation data
export const reportChatroomMember = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_MEMBER_REPORTINGS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
