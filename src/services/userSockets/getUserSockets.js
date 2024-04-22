import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

/**
 * get all sockets of user by id
 * @param userId
 */
export const getUserSockets = async (userId) => {
  const query = `SELECT * from ${TABLES.USER_SOCKETS_TABLE} where user_id = ?`;
  const data = await executeQuery(query, userId);
  return data;
};

export const getUserSocketsByRoomID = async (roomId) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE}  AS CM  
  LEFT JOIN ${TABLES.USER_SOCKETS_TABLE} AS US ON CM.user_id = US.user_id
  WHERE CM.room_id =  ? and CM.status <> 'deleted' and US.app_latest_version > 0`;
  const data = await executeQuery(query, roomId);
  return data;
};
