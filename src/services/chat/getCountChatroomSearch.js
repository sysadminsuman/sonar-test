import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get count for chatroom by search key
export const getCountChatroomSearch = async (searchParams = {}) => {
  let whereQuery = "";
  let havingQuery = "";
  let orderQuery = "";
  let selectFileds = "";
  let joinCMTables = "";
  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";

  let selectParams = [];
  let joinCTParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];

  let joinmembercount =
    " join (select COUNT(id) as active_members,room_id from " +
    TABLES.CHATROOM_MEMBERS_TABLE +
    " where status='active' group by room_id) as CM on CM.room_id=CR.id ";
  if (searchParams.order_by == "") {
    orderQuery = " ORDER BY CR.group_name asc";
  }
  groupByFileds = " GROUP BY CM.room_id";
  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds += "CR.*, CM.active_members ";
    joinCMTables = joinmembercount;

    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }

    orderQuery = " ORDER BY active_members DESC";
  } else {
    joinCMTables = joinmembercount;
    selectFileds += "CR.* ";
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

  if (searchParams && searchParams.cities.length > 0) {
    joinCITables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON (CI.room_id=CR.id AND CI.city_id IN(?))";
    joinCIParams.push(searchParams.cities);
  }

  whereQuery = ' WHERE CR.status <> "deleted"';
  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.searchKey) {
    whereQuery += " AND CR.group_name LIKE ?";
    clauseParams.push(`%${searchParams.searchKey}%`);
  }

  if (searchParams.is_secret == 1) {
    whereQuery += " AND (CR.passcode IS NULL or CR.passcode= '' ) ";
  }

  if (searchParams.durationmonth > 0) {
    whereQuery += " AND CR.create_date >= DATE(NOW() - INTERVAL ? MONTH) ";
    clauseParams.push(searchParams.durationmonth);
  }
  whereQuery += " AND CM.active_members > 0 ";

  let params = [
    ...selectParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...havingParams,
  ];
  const query = `SELECT ${selectFileds} FROM ${TABLES.CHATROOMS_TABLE} as CR ${joinCMTables} ${joinCTTables} ${joinCITables} ${whereQuery} ${groupByFileds} ${havingQuery} ${orderQuery}`;

  const result = await executeQueryReader(query, params);
  return result;
};
