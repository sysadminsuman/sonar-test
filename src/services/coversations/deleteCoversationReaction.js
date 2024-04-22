import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Remove device data by uuid for user
export const deleteCoversationReaction = async (conversation_id, user_id, reaction) => {
  const query = `DELETE FROM ${TABLES.CHATROOM_REACTIONS_TABLE} WHERE conversation_id   = ? AND user_id = ? AND reaction = ?`;
  await executeQuery(query, [conversation_id, user_id, reaction]);
};
