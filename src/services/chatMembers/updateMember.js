import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update member details
export const updateMember = async (updateData, id) => {
  const query = `UPDATE ${TABLES.CHATROOM_MEMBERS_TABLE} SET ? WHERE id = ?`;
  const result = await executeQuery(query, [updateData, id]);
  return result;
};

export const updateChatroomMember = async (updateData, userId, room_id) => {
  let whereCondition = "";
  if (room_id) {
    whereCondition = ` AND room_id = ?`;
  }
  const query = `UPDATE ${TABLES.CHATROOM_MEMBERS_TABLE} SET ? WHERE user_id = ?  ${whereCondition} AND status='active' AND id > 0`;
  const result = await executeQuery(query, [updateData, userId, room_id]);
  return result;
};
