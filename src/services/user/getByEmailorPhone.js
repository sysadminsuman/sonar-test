import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

/**
 *  get user details by either email or phone
 * @param emailPhone
 */
export const getByEmailorPhone = async (emailPhone) => {
  const query = `SELECT * FROM ${TABLES.USER_TABLE} WHERE (email =  '${emailPhone}' OR mobile = '${emailPhone}') AND status <> 'deleted'`;
  const result = await executeQueryReader(query);
  return result[0];
};
