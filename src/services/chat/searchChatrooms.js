import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const searchChatrooms = async (searchParams = {}, offset, limit, userId = "") => {
  let limitQuery = "";
  let whereQuery = "";
  let havingQuery = "";
  let orderQuery = "";
  let selectUserQuery = "";
  let selectFileds = "";
  //let joinCMTables = "";
  let joinCTTables = "";
  let joinCITables = "";
  //let groupByFileds = "";
  let crstar = `CR.id,CR.room_unique_id,CR.user_id,CR.group_name, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
  CR.group_type, CR.latitude, CR.longitude, CR.country, CR.city, CR.address, CR.area_radius, CR.passcode, CR.is_secure_enable, CR.url, CR.last_conversation_id, CR.status, CR.create_date, CR.updated_by, CR.update_date`;
  let join7daycommentcount =
    "left join (select COUNT(id) as day7comments,room_id from " +
    TABLES.CHATROOM_CONVERSATIONS_TABLE +
    " where status='active' and create_date >= DATE(NOW() - INTERVAL 7 DAY) and content_type <> 'info' group by room_id) as CO on CO.room_id=CR.id ";
  const ACTIVEMEMBER =
    " left join (SELECT count(CM.id) as members,room_id FROM " +
    TABLES.CHATROOM_MEMBERS_TABLE +
    " AS CM JOIN " +
    TABLES.USER_TABLE +
    ' AS U ON U.id = CM.user_id where CM.status <> "deleted" and U.status <> "deleted" group by CM.room_id order by count(CM.id) desc) as CM on CM.room_id=CR.id';

  const LASTCONVERTATION = `( select max(create_date) last_activity ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE}  where status <> "deleted" and content_type <> 'info' group by room_id) `;
  let joinlatesttbl = " left join " + LASTCONVERTATION + " as lc on lc.room_id = CM.room_id";

  let selectParams = [];
  let joinCTParams = [];
  let joinCIParams = [];
  let clauseParams = [];
  let havingParams = [];
  let limitParams = [];

  if (userId) {
    selectUserQuery = "checkRoomOwnerByMemberId(CR.id, ?) as owner,";
    selectParams.push(userId);
  }

  if (searchParams.order_by == "") {
    orderQuery = " ORDER BY CR.create_date desc";
  } else if (searchParams.order_by == "hot") {
    orderQuery = " ORDER BY CR.create_date desc , lc.last_activity desc ";
  } else if (searchParams.order_by == "location") {
    orderQuery = " ORDER BY distance asc";
  }

  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds +=
      crstar +
      "," +
      selectUserQuery +
      " CM.members as active_members, IFNULL(last_activity, CR.create_date)  as latest_message_time,CR.group_type ";

    if (searchParams && searchParams.tag_id) {
      joinCTTables =
        " JOIN " + TABLES.CHATROOM_TAGS_TABLE + " AS CT ON (CT.room_id=CR.id AND CT.tag_id=?)";
      joinCTParams.push(searchParams.tag_id);
    }

    //groupByFileds = " GROUP BY CM.room_id";
    if (searchParams.durationday) {
      if (searchParams.durationday > 0) {
        orderQuery =
          " ORDER BY active_members DESC,day7comments DESC ,lc.last_activity desc, CR.create_date desc";
      }
    } else {
      orderQuery = " ORDER BY active_members DESC, lc.last_activity DESC, CR.create_date desc";
    }
  } else {
    selectFileds +=
      crstar +
      " , " +
      selectUserQuery +
      " CM.members as active_members, IFNULL(last_activity, CR.create_date)  as latest_message_time,CR.group_type ";
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
    whereQuery += " AND (CR.passcode IS NULL or CR.passcode = '' ) ";
  }

  if (searchParams.durationmonth > 0) {
    whereQuery += " AND CR.create_date >= DATE(NOW() - INTERVAL ? MONTH) ";
    clauseParams.push(searchParams.durationmonth);
  }

  /* need to move in PROD */
  /*if (searchParams && searchParams.order_by == "noisy" && searchParams.durationday > 0 && searchParams.tag_id == 707) {
    whereQuery += " AND CR.id NOT IN (250)";
  }*/

  whereQuery += " AND CM.members > 0 group by CR.id";

  if (limit) {
    limitQuery += " LIMIT ? OFFSET ?";
    limitParams.push(limit);
    limitParams.push(offset);
  }

  let params = [
    ...selectParams,
    ...joinCTParams,
    ...joinCIParams,
    ...clauseParams,
    ...havingParams,
    ...limitParams,
  ];

  const query = `SELECT ${selectFileds},IF(CR.passcode IS NULL OR CR.passcode = '', false,true) as is_passcode_protected FROM ${TABLES.CHATROOMS_TABLE} as CR ${ACTIVEMEMBER} ${joinlatesttbl} ${joinCTTables} ${join7daycommentcount} ${joinCITables} ${whereQuery} ${havingQuery} ${orderQuery} ${limitQuery}`;

  /*const result = await executeQueryReader(query, params, function (err, rows) {
    console.log(this.sql);
  });*/
  const result = await executeQueryReader(query, params);
  return result;
};

export const participantImages = async (room_id) => {
  const query = `SELECT CM.user_id, U.name, U.profile_image,
  if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image
  FROM ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM JOIN ${TABLES.USER_TABLE} AS U ON (U.id=CM.user_id) WHERE CM.room_id =  ?  AND U.status = 'active' AND CM.status = 'active' ORDER BY CM.create_date ASC`;

  const result = await executeQueryReader(query, room_id);
  return result;
};
