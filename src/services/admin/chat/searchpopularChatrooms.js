import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
export const searchpopularChatrooms = async (searchParams = {}) => {
  let whereQuery = " WHERE 1=1 ";
  let joinCTTables = "";

  let joinCTParams = [];
  let clauseParams = [];

  let maintbl = `select * from (SELECT CR.create_date,U.name as owner,U.id as owner_user_id,CR.passcode,day7convertations,CR.id,CR.room_unique_id,CR.user_id,CR.group_name,
 if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
 if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
 if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
 group_type, CR.latitude, CR.longitude, CR.country, city, CR.address, CR.area_radius,   CR.is_secure_enable, CR.url, CR.last_conversation_id, CR.status,   CR.updated_by, CR.update_date, COUNT(CM.id) as active_members, getLatestMessageTimeByRoomId(CR.id) as latest_message_time 
 FROM ${TABLES.CHATROOMS_TABLE} as CR 
 JOIN ${TABLES.USER_TABLE} AS U ON (U.id=CR.user_id)  
 left join (SELECT count(id) as day7convertations ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE} where status = "active" and create_date >= DATE(NOW() - INTERVAL 7 DAY) group by room_id) as CC on CC.room_id=CR.id   JOIN  ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM ON (CM.room_id=CR.id AND CM.status='active')    
 WHERE 1=1   GROUP BY CM.room_id   ORDER BY active_members DESC  LIMIT 10 OFFSET 0 ) as m `;
  if (searchParams && searchParams.cities > 0) {
    joinCTTables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON  CI.room_id=m.id AND CI.city_id =?";
    joinCTParams.push(searchParams.cities);
  }
  if (searchParams && searchParams.status) {
    whereQuery += " AND  m.status = ?";
    clauseParams.push(searchParams.status);
  }
  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.searchKey) {
    whereQuery += " AND m.group_name LIKE ?";
    clauseParams.push(`%${searchParams.searchKey}%`);
  }
  if (
    (searchParams && searchParams.group_type == "general") ||
    searchParams.group_type == "location"
  ) {
    whereQuery += " AND m.group_type = ?";
    clauseParams.push(searchParams.group_type);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.user) {
    whereQuery += " AND m.owner LIKE ?";
    clauseParams.push(`%${searchParams.user}%`);
  }

  if (searchParams && searchParams.create_start_date && !searchParams.create_end_date) {
    whereQuery += " AND DATE(m.create_date) >=?";
    clauseParams.push(searchParams.create_start_date);
  }
  if (searchParams && searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(m.create_date) >=? AND DATE(m.create_date) <=?";
    clauseParams.push(searchParams.create_start_date);
    clauseParams.push(searchParams.create_end_date);
  }
  if (searchParams && !searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(m.create_date) <=?";
    clauseParams.push(searchParams.create_end_date);
  }

  if (searchParams && searchParams.last_start_date && !searchParams.last_end_date) {
    whereQuery += " AND DATE(m.create_date) >=?";
    clauseParams.push(searchParams.last_start_date);
  }
  if (searchParams && searchParams.last_start_date && searchParams.last_end_date) {
    whereQuery += " AND DATE(m.latest_message_time) >=? AND DATE(m.latest_message_time) <=?";
    clauseParams.push(searchParams.last_start_date);
    clauseParams.push(searchParams.last_end_date);
  }
  if (searchParams && !searchParams.last_start_date && searchParams.last_end_date) {
    whereQuery += " AND DATE(m.latest_message_time) <=?";
    clauseParams.push(searchParams.last_end_date);
  }
  if (searchParams && searchParams.is_secret && searchParams.is_secret != "false") {
    whereQuery += " AND  m.passcode IS NOT NULL AND m.passcode <> '' ";
  }
  let params = [...joinCTParams, ...clauseParams];
  let query = ` ${maintbl} ${joinCTTables} ${whereQuery} `;
  const result = await executeQueryReader(query, params);
  return result;
};
