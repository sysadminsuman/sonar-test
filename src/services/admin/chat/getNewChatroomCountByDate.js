import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

/**
 *  get new chatrrom type
 *
 */
export const getNewChatroomCountByDate = async (chatroomType, date) => {
  let query = "";
  let params = [];
  if (chatroomType == "general") {
    query = `SELECT count(*) as gereral_count FROM ${TABLES.CHATROOMS_TABLE} WHERE DATE(create_date) = ? and group_type ='general' and status <> 'deleted'`;
    params.push(date);
  } else if (chatroomType == "region") {
    query = `SELECT count(*) as region_count FROM ${TABLES.CHATROOMS_TABLE} WHERE DATE(create_date) = ? and group_type ='location'  and status <> 'deleted'`;
    params.push(date);
  } else {
    query = `SELECT count(*) as total, (SELECT count(*) from ${TABLES.CHATROOMS_TABLE} where DATE(create_date) = ? and group_type ='location' and status <> 'deleted')as region_count,(SELECT count(*) from ${TABLES.CHATROOMS_TABLE} where DATE(create_date) = ? and group_type ='general' and status <> 'deleted')as gereral_count FROM ${TABLES.CHATROOMS_TABLE} WHERE create_date = DATE( ? )  and status <> 'deleted'`;
    params.push(date);
    params.push(date);
    params.push(date);
  }

  const result = await executeQueryReader(query,params);
  return result[0];
};
