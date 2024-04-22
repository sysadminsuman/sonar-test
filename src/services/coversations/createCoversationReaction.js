import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation reactions data
export const createCoversationReaction = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_REACTIONS_TABLE} SET ?`;
  const result = await executeQuery(query, data);
  return result.insertId;
};
