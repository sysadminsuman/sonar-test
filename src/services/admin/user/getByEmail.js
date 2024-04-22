import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import executeQuery from "../../executeQuery.js";

/**
 *  get user details by email
 * @param email
 */
export const getByEmail = async (email, userType) => {
  let params = [email];
  let whereCondition = "";
  if (userType) {
    whereCondition = ` AND user_type = ? `;
    params.push(userType);
  }

  const query = `SELECT * FROM ${TABLES.USER_TABLE} WHERE email = ? and status <> 'deleted' ${whereCondition}`;
  const result = await executeQueryReader(query, params);

  return result[0];
};
export const getLoginCountUpdate = async (email, alldata) => {
  const query = `UPDATE ${TABLES.USER_TABLE} SET ?  WHERE email = ? and status <> 'deleted' `;
  return await executeQuery(query, [alldata, email]);
};
