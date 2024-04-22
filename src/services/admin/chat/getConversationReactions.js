import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get parent conversations details
export const getConversationReactions = async (conversation_id) => {
  const query = `SELECT count(id) as total_reaction,reaction FROM ${TABLES.CHATROOM_REACTIONS_TABLE}  WHERE conversation_id   = ? GROUP BY reaction`;

  const result = await executeQueryReader(query, conversation_id);
  return result;
};

export const checkUserConversationReactionsExists = async (conversation_id, user_id, reaction) => {
  let whereCondition = "";
  let params = [];
  params.push(conversation_id);
  params.push(user_id);
  if (reaction) {
    whereCondition = ` AND reaction = ?`;
    params.push(reaction);
  }
  const query = `SELECT count(id) as total_reaction FROM ${TABLES.CHATROOM_REACTIONS_TABLE}  WHERE conversation_id   = ? AND user_id = ? ${whereCondition}`;

  const result = await executeQueryReader(query, params);
  return result[0].total_reaction;
};

// export const checkConversationReactionsExists = async (conversation_id) => {
//   const query = `SELECT count(id) as total_reaction FROM ${TABLES.CHATROOM_REACTIONS_TABLE}  WHERE conversation_id   = '${conversation_id}'`;
//   const result = await executeQuery(query);
//   return result[0].total_reaction;
// };
