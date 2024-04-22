import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert chatroom member
export const createGroupMember = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_MEMBERS_TABLE} SET ?`;
  const roomId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return roomId;
};
