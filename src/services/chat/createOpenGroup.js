import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insertion of group creation
export const createOpenGroup = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOMS_TABLE} SET ?`;
  const roomId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return roomId;
};
