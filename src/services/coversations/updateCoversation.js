import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert conversation data
export const updateCoversation = async (data, id) => {
  const query = `UPDATE ${TABLES.CHATROOM_CONVERSATIONS_TABLE} SET ? WHERE 	id=?`;
  await executeQuery(query, [data, id]);
  return id;
};

export const updateCoversationByUserID = async (data, room_id, user_id) => {
  const query = `UPDATE ${TABLES.CHATROOM_CONVERSATIONS_TABLE} SET ? WHERE 	room_id=? AND user_id=?`;
  await executeQuery(query, [data, room_id, user_id]);
  return user_id;
};
