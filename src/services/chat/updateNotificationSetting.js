import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateNotificationSetting = async (data, room_id, user_id) => {
  const query = `UPDATE ${TABLES.CHATROOM_MEMBERS_TABLE} SET ? WHERE room_id=? AND user_id=?`;
  return await executeQuery(query, [data, room_id, user_id]);
};
