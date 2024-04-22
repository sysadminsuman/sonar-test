import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update chatroom
export const updateChatroom = async (data, id) => {
  const query = `UPDATE ${TABLES.CHATROOMS_TABLE} SET ? WHERE id = ${id}`;
  const result = await executeQuery(query, data);
  return result;
};
