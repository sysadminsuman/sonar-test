import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getCountUserNotParticipatingChatrooms = async (userId, searchParams = {}) => {
  let whereQuery = "";
  let havingQuery = "";
  let orderQuery = "";
  let selectFileds = "";

  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";

  let selectParams = [];
  let joinCTParams = [];
  let joinCMParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];
  let userParams = [];

  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds += "CR.*, CM.active_members ";

    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }
    groupByFileds = " GROUP BY CM.room_id";
    orderQuery = " ORDER BY active_members DESC";
  } else {
    selectFileds += "CR.* ";
    if (searchParams && searchParams.latitude && searchParams.longitude && searchParams.radius) {
      selectFileds += ", get_distance(?,?,CR.latitude,CR.longitude) AS distance  ";
      havingQuery += "HAVING distance < ?";
      selectParams.push(searchParams.latitude);
      selectParams.push(searchParams.longitude);
      havingParams.push(searchParams.radius);
    }
  }

  let joinCMTables =
    " join (select COUNT(id) as active_members,room_id from " +
    TABLES.CHATROOM_MEMBERS_TABLE +
    " where status='active' " +
    (searchParams.durationday > 0 ? " and create_date >= DATE(NOW() - INTERVAL ? DAY)" : "") +
    " group by room_id) as CM on CM.room_id=CR.id ";
  if (searchParams.durationday > 0) {
    joinCMParams.push(searchParams.durationday);
  }

  if (searchParams && searchParams.cities.length > 0) {
    joinCITables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON (CI.room_id=CR.id AND CI.city_id IN(?))";
    joinCIParams.push(searchParams.cities);
  }

  if (searchParams.order_by == "") {
    orderQuery = " ORDER BY CR.group_name asc";
  }

  whereQuery = ' WHERE CR.status <> "deleted"';
  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.searchKey) {
    whereQuery += " AND CR.group_name LIKE ?";
    clauseParams.push(`%${searchParams.searchKey}%`);
  }

  if (searchParams && searchParams.is_secret) {
    whereQuery += " AND CR.passcode IS NOT NULL";
  }

  if (searchParams.durationmonth > 0) {
    whereQuery += " AND CR.create_date >= DATE(NOW() - INTERVAL ? MONTH) ";
    clauseParams.push(searchParams.durationmonth);
  }

  whereQuery += " AND CM.active_members > 0 ";
  userParams.push(userId);

  let params = [
    ...selectParams,
    ...joinCMParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...userParams,
    ...havingParams,
  ];

  const query = `select ${selectFileds} from ${TABLES.CHATROOMS_TABLE} as CR ${joinCMTables} ${joinCTTables} ${joinCITables} ${whereQuery} AND CR.status = 'active' AND CR.id NOT IN (SELECT DISTINCT(room_id) FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE user_id = ? and status='active' GROUP BY room_id) ${groupByFileds} ${havingQuery} ${orderQuery}`;

  const result = await executeQueryReader(query, params);

  return result;
};

export const getCountUserNotParticipatingChatroomsoptimised = async (userId, searchParams = {}) => {
  let whereQuery = "";
  let havingQuery = "";
  let orderQuery = "";
  let selectFileds = "";

  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";

  let selectParams = [];
  let joinCTParams = [];
  let joinCMParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];
  let userParams = [];
  whereQuery = ' WHERE CR.status <> "deleted" and CR.group_type = "general" ';
  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds += "CR.*, CM.active_members ";

    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }
    groupByFileds = " GROUP BY CM.room_id";
  } else {
    selectFileds += "CR.* ";
    if (searchParams && searchParams.latitude && searchParams.longitude && searchParams.radius) {
      selectFileds += ", get_distance(?,?,CR.latitude,CR.longitude) AS distance ";
      selectParams.push(searchParams.latitude);
      selectParams.push(searchParams.longitude);
      if (searchParams.order_by == "location" && searchParams.city != "") {
        whereQuery += ` AND CR.id in (SELECT DISTINCT  room_id 
            FROM  ${TABLES.CHATROOM_CITIES_TABLE}
            where status="active" 
            and city_id in (SELECT id FROM ${TABLES.CITY_TABLE} where name = ? or name_en = ? )) `;
        clauseParams.push(searchParams.city.trim());
        clauseParams.push(searchParams.city.trim());
      } else {
        havingQuery += "HAVING distance < ?";
        havingParams.push(searchParams.radius);
      }
    }
  }

  let joinCMTables =
    " join (select COUNT(id) as active_members,room_id from " +
    TABLES.CHATROOM_MEMBERS_TABLE +
    " where status='active' " +
    (searchParams.durationday > 0 ? " and create_date >= DATE(NOW() - INTERVAL ? DAY)" : "") +
    " group by room_id) as CM on CM.room_id=CR.id ";
  if (searchParams.durationday > 0) {
    joinCMParams.push(searchParams.durationday);
  }

  if (searchParams && searchParams.cities.length > 0) {
    joinCITables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON (CI.room_id=CR.id AND CI.city_id IN(?))";
    joinCIParams.push(searchParams.cities);
  }

  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.searchKey) {
    whereQuery += " AND CR.group_name LIKE ?";
    clauseParams.push(`%${searchParams.searchKey}%`);
  }

  if (searchParams && searchParams.is_secret) {
    whereQuery += " AND CR.passcode IS NOT NULL";
  }

  if (searchParams.durationmonth > 0) {
    whereQuery += " AND CR.create_date >= DATE(NOW() - INTERVAL ? MONTH) ";
    clauseParams.push(searchParams.durationmonth);
  }

  whereQuery += " AND CM.active_members > 0 ";
  userParams.push(userId);

  let params = [
    ...selectParams,
    ...joinCMParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...userParams,
    ...havingParams,
  ];
  const query = `select ${selectFileds} from ${TABLES.CHATROOMS_TABLE} as CR ${joinCMTables} ${joinCTTables} ${joinCITables} ${whereQuery} AND CR.status = 'active' AND CR.id NOT IN (SELECT DISTINCT(room_id) FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE user_id = ? and status='active' GROUP BY room_id) ${groupByFileds} ${havingQuery} ${orderQuery}`;
  const result = await executeQueryReader(query, params);

  return result.length;
};
