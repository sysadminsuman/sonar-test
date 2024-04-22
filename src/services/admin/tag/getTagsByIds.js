import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getTagsByIds = async (tagIds) => {
  const query = `SELECT GROUP_CONCAT(name separator " #") as tag_list FROM ${TABLES.TAG_TABLE}  WHERE status = 'active' AND id IN(${tagIds}) ORDER BY name asc`;
  const result = await executeQueryReader(query);
  return result[0].tag_list;
};
