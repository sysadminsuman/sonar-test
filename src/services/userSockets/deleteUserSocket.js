import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

/**
 * Remove user socket data by socket id
 * @param socketId
 */
export const deleteUserSocket = async (socketId) => {
  const query = `DELETE FROM ${TABLES.USER_SOCKETS_TABLE} WHERE socket_id = ?`;
  await executeQuery(query, socketId);
};
