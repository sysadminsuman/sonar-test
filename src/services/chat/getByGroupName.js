import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get chatroom by name
export const getByGroupName = async (groupName) => {
  let params = `%${groupName}%`;

  // search keyword is "sw" for group_name search
  const query = `SELECT * FROM ${TABLES.CHATROOMS_TABLE} WHERE group_name LIKE ? and status <> 'deleted'`;
  const result = await executeQueryReader(query, params);
  return result[0];
};
