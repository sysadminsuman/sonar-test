import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getByRoomId = async (roomId) => {
  const query = `SELECT * FROM ${TABLES.CHATROOMS_TABLE} WHERE id = ${roomId} and status <> 'deleted'`;
  const result = await executeQueryReader(query);
  return result[0];
};
