import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update conversation reactions data

export const updateCoversationReaction = async (data, conversation_id, user_id) => {
  const query = `UPDATE ${TABLES.CHATROOM_REACTIONS_TABLE} SET ? WHERE conversation_id   = ? AND user_id = ?`;

  await executeQuery(query, [data, conversation_id, user_id]);
  return conversation_id;
};
