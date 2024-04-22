import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getTag = async () => {
  const query = `SELECT id, name FROM ${TABLES.TAG_TABLE} WHERE status = 'active' AND is_default='y'`;
  const result = await executeQueryReader(query);
  return result;
};
