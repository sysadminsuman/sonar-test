import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get member details
export const getKickedChatroomMember = async (roomId, userId) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id = ? AND user_id  = ? AND is_kicked='y'`;

  const result = await executeQueryReader(query, [roomId, userId]);
  return result[0];
};
