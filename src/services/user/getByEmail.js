import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
/**
 *  get user details by email
 * @param email
 */
export const getByEmail = async (email, userType) => {
  let whereCondition = "";
  if (userType) {
    whereCondition = ` AND user_type = ?`;
  }

  const query = `SELECT id, email, name, mobile, 
  if(profile_image = "", "",CONCAT("${envs.aws.cdnpath}", profile_image)) as profile_image,
  user_type, api_token, ip_address, last_activity_date, status, created_by, create_date, updated_by, update_date
   FROM ${TABLES.USER_TABLE} WHERE email = ? and status <> 'deleted' ${whereCondition}`;
  const result = await executeQuery(query, [email, userType]);
  return result[0];
};
