import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get parent conversations details
export const getConversationReactions = async (conversation_id) => {
  const query = `SELECT count(id) as total_reaction,reaction FROM ${TABLES.CHATROOM_REACTIONS_TABLE}  WHERE conversation_id   = ? GROUP BY reaction`;

  const result = await executeQuery(query, conversation_id);
  return result;
};

export const checkUserConversationReactionsExists = async (conversation_id, user_id, reaction) => {
  let qparams = [conversation_id, user_id];
  let whereCondition = "";
  if (reaction) {
    whereCondition = ` AND reaction = ? `;
    qparams.push(reaction);
  }
  const query = `SELECT count(id) as total_reaction FROM ${TABLES.CHATROOM_REACTIONS_TABLE}  WHERE conversation_id   = ? AND user_id = ? ${whereCondition}`;

  const result = await executeQuery(query, qparams);
  return result[0].total_reaction;
};
