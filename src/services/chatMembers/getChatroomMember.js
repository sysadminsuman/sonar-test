import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get member details
export const getChatroomMember = async (roomId, userId) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id = ? AND user_id  = ? AND status='active' limit 1`;

  const result = await executeQuery(query, [roomId, userId]);
  return result[0];
};
