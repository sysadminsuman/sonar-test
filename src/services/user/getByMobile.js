import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

/**
 *  get user details by mobile
 * @param mobile
 */
export const getByMobile = async (mobile) => {
  const query = `SELECT * FROM ${TABLES.USER_TABLE} WHERE mobile = '${mobile}' and status <> 'deleted'`;
  const result = await executeQueryReader(query);
  return result[0];
};
