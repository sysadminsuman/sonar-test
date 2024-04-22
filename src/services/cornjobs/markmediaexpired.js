import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const getExpirable = async () => {
  /*let query = `SELECT id,if(file_name = "", "",CONCAT("${envs.aws.imgpath}",file_name)) as file_name FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} where DATE(create_date) <= DATE(NOW() - INTERVAL  180 DAY) and expired=0 ;`;*/
  let query = `SELECT id,if(file_name = "", "",CONCAT("${envs.aws.imgpath}",file_name)) as file_name FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} where (DATE(create_date) <= DATE(NOW() - INTERVAL  180 DAY) and expired=0)`;

  let result = await executeQuery(query);
  return result;
};

export const markmediaexpired = async (ids) => {
  let query = `UPDATE ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} SET expired = 1 WHERE id in (?) ;`;
  return await executeQuery(query, [ids]);
};
