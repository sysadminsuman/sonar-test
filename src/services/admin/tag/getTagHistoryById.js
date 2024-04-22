import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getTagHistoryById = async (id) => {
  const query = `SELECT tm.name,tm.status,tm.updated_by,tm.update_date,u.name as moderator FROM ${TABLES.TAG_MODIFICATION_LOG_TABLE} as tm JOIN ${TABLES.TAG_TABLE} as t ON tm.tag_id=t.id JOIN ${TABLES.USER_TABLE} as u ON tm.updated_by=u.id  WHERE tag_id = ? ORDER BY tm.id desc`;
  const result = await executeQueryReader(query, id);
  return result;
};
