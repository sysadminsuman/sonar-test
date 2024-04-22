import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update chatroom
export const updateMimeType = async (data, id) => {
  const query = `UPDATE ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} SET ? WHERE id = ?`;
  const result = await executeQuery(query, [data, id]);
  return result;
};
