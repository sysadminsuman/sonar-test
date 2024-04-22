import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

/**
 *  get user details by id
 * @param userId
 */
export const getAllJoinedMember = async (userId) => {
  const query = `SELECT user_id FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id IN (SELECT room_id FROM ${TABLES.CHATROOM_MEMBERS_TABLE} where user_id = ? GROUP BY room_id) GROUP BY user_id`;

  const result = await executeQueryReader(query, userId);
  return result;
};
