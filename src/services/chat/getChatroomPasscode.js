import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getChatroomPasscode = async (room_id) => {
  const query = `select IF(passcode IS NULL , '',passcode) as passcode from ${TABLES.CHATROOMS_TABLE} where id = ?`;
  const result = await executeQueryReader(query, room_id);
  return result[0].passcode;
};
