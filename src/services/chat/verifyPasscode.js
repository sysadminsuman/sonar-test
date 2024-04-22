import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const verifyPasscode = async (room_id) => {
  const query = `select id, group_name, passcode, group_name from ${TABLES.CHATROOMS_TABLE} where id = ${room_id}`;
  const result = await executeQuery(query);
  return result[0];
};
