import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update conversation notice data
export const updateCoversationNotice = async (data, notice_id) => {
  const query = `UPDATE ${TABLES.CHATROOM_NOTICES_TABLE} SET ? WHERE id   = ?`;

  await executeQuery(query, [data, notice_id]);
  return notice_id;
};
