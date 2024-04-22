import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

/**
 *  get user details by id
 * @param userId
 */
export const getNewLoginCountByDate = async (date) => {
  const query = `SELECT count(*) as login_count FROM ${TABLES.USER_TABLE} WHERE create_date = DATE( ? ) and user_type = 'user' and status <> 'deleted'`;
  const result = await executeQueryReader(query,date);
  return result[0];
};
