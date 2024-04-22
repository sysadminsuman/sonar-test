import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
/**
 *  get user details by customer_id
 * @param customer_id
 */
export const getByCustomerID = async (customer_id) => {
  const query = `SELECT id, name,profile_image, 
  if(default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}", default_profile_image)) as default_profile_image,is_withdrawal,is_overall_notification,is_room_creation_notification,is_location_enabled,is_logged_in,
  user_type, api_token, ip_address, last_activity_date,customer_id, status, created_by, create_date, updated_by, update_date
   FROM ${TABLES.USER_TABLE} WHERE customer_id = ?`;
  const result = await executeQuery(query, customer_id);
  return result[0];
};
