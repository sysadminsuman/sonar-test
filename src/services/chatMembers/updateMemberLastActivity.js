import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// update last activity time of member
export const updateMemberLastActivity = async (updateData) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_MEMBERS_TABLE} (id, last_activity_date) VALUES ? AS new
  ON DUPLICATE KEY UPDATE last_activity_date = new.last_activity_date`;
  const result = await executeQuery(query, [updateData]);
  return result;
};
