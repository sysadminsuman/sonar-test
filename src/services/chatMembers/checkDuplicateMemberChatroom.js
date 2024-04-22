import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const checkDuplicateMemberChatroom = async (roomId, userId) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id = '${roomId}' AND user_id  = '${userId}' AND status <> 'deleted'`;
  const result = await executeQuery(query);
  return result[0];
};
