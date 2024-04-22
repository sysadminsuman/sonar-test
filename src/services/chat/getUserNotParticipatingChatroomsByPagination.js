import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
// serach chatrooms by user and search key
export const getUserNotParticipatingChatroomsByPagination = async (
  searchParams = {},
  userId,
  offset,
  limit,
) => {
  let limitQuery = "";
  let whereQuery = "";
  let havingQuery = "";
  let orderQuery = "";
  let selectUserQuery = "";
  let selectFileds = "";
  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";

  let selectParams = [];
  let joinCTParams = [];
  let joinATMParams = [];
  let joinLAParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];
  let userParams = [];
  let limitParams = [];

  if (userId) {
    selectUserQuery = "checkRoomOwnerByMemberId(CR.id, ?) as owner,";
    selectParams.push(userId);
  }

  whereQuery = ' WHERE CR.status <> "deleted"';

  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds +=
      "CR.*,if(CR.group_image = '', '',CONCAT('" +
      envs.aws.cdnpath +
      "',group_image)) as group_image," +
      selectUserQuery +
      " CM.members as active_members, IFNULL(last_massage_time, CR.create_date) as latest_message_time ";

    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }

    groupByFileds += " GROUP BY CM.room_id";
    if (searchParams.durationday > 0) {
      orderQuery = " ORDER BY members DESC,convertations desc";
    } else {
      orderQuery = " ORDER BY active_members DESC";
    }
  } else {
    selectFileds +=
      "CR.*,if(CR.group_image = '', '',CONCAT('" +
      envs.aws.cdnpath +
      "',group_image)) as group_image," +
      selectUserQuery +
      " CM.members as active_members, IFNULL(last_massage_time, CR.create_date) as latest_message_time ";
    if (searchParams && searchParams.latitude && searchParams.longitude && searchParams.radius) {
      selectFileds += ", get_distance(?,?,CR.latitude,CR.longitude) AS distance  ";
      selectParams.push(searchParams.latitude);
      selectParams.push(searchParams.longitude);

      if (searchParams.order_by == "location" && searchParams.city != "") {
        selectFileds += ", CI.city ";
        joinCITables = ` join (SELECT 
      group_concat(c.name order by c.name=? desc) as city,
      ct.room_id
      FROM ${TABLES.CHATROOM_CITIES_TABLE} as ct
      left join ${TABLES.CITY_TABLE} as c on c.id=ct.city_id where ct.status="active"
      group by ct.room_id) as CI ON  CI.room_id=CR.id`;
        joinCIParams.push(searchParams.city);
        whereQuery += ` AND CR.id in (SELECT DISTINCT  room_id 
            FROM  ${TABLES.CHATROOM_CITIES_TABLE}
            where status="active" 
            and city_id in (SELECT id FROM ${TABLES.CITY_TABLE} where name = ? or name_en = ? )) `;
        clauseParams.push(searchParams.city.trim());
        clauseParams.push(searchParams.city.trim());
        orderQuery = " ORDER BY distance asc";
        whereQuery += ' and  CR.group_type = "general" ';
      } else {
        havingQuery += "HAVING distance < ?";
        havingParams.push(searchParams.radius);
      }
    }
  }

  let joinLATables =
    " left join (select max(create_date) as last_massage_time ,count(id) as convertations  ,room_id from " +
    TABLES.CHATROOM_CONVERSATIONS_TABLE +
    " where status ='active' " +
    (searchParams.durationday > 0 ? " and create_date >= DATE(NOW() - INTERVAL ? DAY)" : "") +
    " group by room_id) as la on la.room_id=CR.id ";
  if (searchParams.durationday > 0) {
    joinLAParams.push(searchParams.durationday);
  }

  let joinATMables =
    "  join (select count(id) as members ,room_id from " +
    TABLES.CHATROOM_MEMBERS_TABLE +
    " where status ='active' " +
    (searchParams.durationday > 0 ? " and create_date >= DATE(NOW() - INTERVAL ? DAY)" : "") +
    " group by room_id) as CM on CM.room_id=CR.id ";
  if (searchParams.durationday > 0) {
    joinATMParams.push(searchParams.durationday);
  }

  if (searchParams.order_by == "") {
    orderQuery = " ORDER BY CR.group_name asc";
  } else if (searchParams.order_by == "hot") {
    orderQuery = " ORDER BY CR.create_date desc , latest_message_time desc ";
  } else if (searchParams.order_by == "location") {
    orderQuery = " ORDER BY distance asc";
  }

  if (searchParams && searchParams.cities.length > 0) {
    joinCITables =
      " JOIN " + TABLES.CHATROOM_CITIES_TABLE + " AS CI ON (CI.room_id=CR.id AND CI.city_id IN(?))";
    joinCIParams.push(searchParams.cities.join(","));
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
  if (searchParams.durationday > 0) {
    whereQuery += " AND CR.create_date >= DATE(NOW() - INTERVAL ? DAY) ";
    clauseParams.push(searchParams.durationday);
  }
  whereQuery += " AND CM.members > 0 ";

  userParams.push(userId);
  if (limit) {
    limitQuery += " LIMIT ? OFFSET ?";
    limitParams.push(limit);
    limitParams.push(offset);
  }

  let params = [
    ...selectParams,
    ...joinLAParams,
    ...joinATMParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...userParams,
    ...havingParams,
    ...limitParams,
  ];

  const query = `select ${selectFileds},IF(CR.passcode IS NULL OR CR.passcode = '', false,true) as is_passcode_protected 
  from ${TABLES.CHATROOMS_TABLE} as CR 
  ${joinLATables} ${joinATMables} ${joinCTTables} ${joinCITables} 
  ${whereQuery} AND CR.status = 'active' 
  AND CR.id NOT IN (SELECT DISTINCT(room_id) FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE user_id = ? and status='active'  ) ${groupByFileds} ${havingQuery} ${orderQuery} ${limitQuery}`;

  /*const result = await executeQueryReader(query, params, function (err, rows) {
    console.log(this.sql);
  });*/
  const result = await executeQueryReader(query, params);

  return result;
};
