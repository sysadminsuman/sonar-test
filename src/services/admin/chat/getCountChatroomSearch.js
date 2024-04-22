import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get count for chatroom by search key
export const getCountChatroomSearch = async (searchParams = {}) => {
  let whereQuery = "WHERE 1=1";
  let havingQuery = "";
  let orderQuery = "";
  let selectFileds = "";
  let joinCMTables = "";
  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";
  if (searchParams.order_by == "") {
    orderQuery = " ORDER BY CR.id desc";
  }

  let selectParams = [];
  let joinCTParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];
  const LASTCONVERTATION = `( select max(create_date) last_activity ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE}  where status <> "deleted" and content_type <> 'info' group by room_id) `;
  let joinlatesttbl = " left join " + LASTCONVERTATION + " as lc on lc.room_id = CR.id";
  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds +=
      "CR.*, COUNT(CM.id) as active_members ,getLatestMessageTimeByRoomId(CR.id) as latest_message_time";
    joinCMTables =
      " JOIN " +
      TABLES.CHATROOM_MEMBERS_TABLE +
      " AS CM ON (CM.room_id=CR.id AND CM.status='active')";
    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }
    groupByFileds = " GROUP BY CM.room_id";
    //orderQuery = " ORDER BY active_members DESC";
    orderQuery =
      " ORDER BY active_members DESC,day7convertations desc,lc.last_activity desc,CR.create_date desc";
  } else {
    selectFileds += "CR.* , getLatestMessageTimeByRoomId(CR.id) as latest_message_time";
    if (searchParams && searchParams.latitude && searchParams.longitude && searchParams.radius) {
      selectFileds +=
        ", ( 3959 * acos( cos( radians(?) ) * cos( radians(CR.latitude) ) * cos( radians( CR.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( CR.latitude ) ) ) ) AS distance ";
      havingQuery += "HAVING distance < ?";
      selectParams.push(searchParams.latitude);
      selectParams.push(searchParams.longitude);
      selectParams.push(searchParams.latitude);
      havingParams.push(searchParams.radius);
    }
  }

  if (searchParams && searchParams.cities > 0) {
    joinCITables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON  CI.room_id=CR.id AND CI.city_id =?";
    joinCIParams.push(searchParams.cities);
  }

  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.searchKey) {
    whereQuery += " AND CR.group_name LIKE ?";
    clauseParams.push(`%${searchParams.searchKey}%`);
  }

  if (
    (searchParams && searchParams.group_type == "general") ||
    searchParams.group_type == "location"
  ) {
    whereQuery += " AND CR.group_type = ?";
    clauseParams.push(searchParams.group_type);
  }
  if ((searchParams && searchParams.status == "active") || searchParams.status == "deleted") {
    whereQuery += " AND CR.status = ?";
    clauseParams.push(searchParams.status);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.user) {
    whereQuery += " AND U.name LIKE ?";
    clauseParams.push(`%${searchParams.user}%`);
  }
  if (searchParams && searchParams.create_start_date && !searchParams.create_end_date) {
    whereQuery += " AND DATE(CR.create_date) >=?";
    clauseParams.push(searchParams.create_start_date);
  }
  if (searchParams && searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(CR.create_date) >=? AND DATE(CR.create_date) <=?";
    clauseParams.push(searchParams.create_start_date);
    clauseParams.push(searchParams.create_end_date);
  }
  if (searchParams && !searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(CR.create_date) <=?";
    clauseParams.push(searchParams.create_end_date);
  }

  if (searchParams && searchParams.last_start_date && !searchParams.last_end_date) {
    whereQuery += " Having DATE(latest_message_time) >=?";
    clauseParams.push(searchParams.last_start_date);
  }
  if (searchParams && searchParams.last_start_date && searchParams.last_end_date) {
    whereQuery += " Having DATE(latest_message_time) >=? AND DATE(latest_message_time) <=?";
    clauseParams.push(searchParams.last_start_date);
    clauseParams.push(searchParams.last_end_date);
  }
  if (searchParams && !searchParams.last_start_date && searchParams.last_end_date) {
    whereQuery += " Having DATE(latest_message_time) <=?";
    clauseParams.push(searchParams.last_end_date);
  }

  if (searchParams && searchParams.is_secret) {
    whereQuery += " AND CR.passcode IS NOT NULL AND CR.passcode <> '' ";
  }

  const DAYS7POPULAR = ` left join (SELECT count(id) as day7convertations, room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE} where status = "active" and create_date >= DATE(NOW() - INTERVAL 7 DAY) group by room_id) as CC on CC.room_id=CR.id `;

  let params = [
    ...selectParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...havingParams,
  ];
  const query = `SELECT CR.create_date,U.name as owner,CR.passcode, ${selectFileds} FROM ${TABLES.CHATROOMS_TABLE} as CR JOIN ${TABLES.USER_TABLE} AS U ON (U.id=CR.user_id)  ${DAYS7POPULAR} ${joinlatesttbl} ${joinCMTables} ${joinCTTables} ${joinCITables} ${whereQuery} ${groupByFileds} ${havingQuery} ${orderQuery}`;

  const result = await executeQueryReader(query, params);
  return result;
};
