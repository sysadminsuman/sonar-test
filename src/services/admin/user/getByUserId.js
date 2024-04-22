import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
/**
 *  get user details by id
 * @param userId
 */
export const getByUserId = async (userId) => {
  const query = `SELECT id, email, password, name, mobile, customer_id,
  if(profile_image = "", "",CONCAT("${envs.aws.cdnpath}",profile_image)) as profile_image, user_type, api_token, ip_address, last_activity_date, status, created_by, create_date, updated_by, update_date FROM ${TABLES.USER_TABLE} WHERE id = ? and status <> 'deleted'`;
  const result = await executeQueryReader(query,userId);
  return result[0];
};
