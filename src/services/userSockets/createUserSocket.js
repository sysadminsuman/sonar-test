import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Insert user socket data
export const createUserSocket = async (data) => {
  const query = `INSERT INTO ${TABLES.USER_SOCKETS_TABLE} SET ?`;
  await executeQuery(query, data);
};
