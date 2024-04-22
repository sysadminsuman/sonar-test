import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
export const searchChatrooms = async (searchParams = {}, offset, limit, userId = "") => {
  let limitQuery = "";
  let whereQuery = " WHERE 1=1 ";
  let havingQuery = "";
  let orderQuery = "";
  let selectUserQuery = "";
  let selectFileds = "";
  let joinCMTables = "";
  let joinCTTables = "";
  let joinCITables = "";
  let groupByFileds = "";

  let crstar = `CR.id,CR.room_unique_id,CR.user_id,CR.group_name, 
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small ,
  group_type, CR.latitude, CR.longitude, CR.country, city, CR.address, CR.area_radius, CR.passcode, CR.is_secure_enable, CR.url, CR.last_conversation_id, CR.status, CR.create_date, CR.updated_by, CR.update_date`;

  const LASTCONVERTATION = `( select max(create_date) last_activity ,room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE}  where status <> "deleted" and content_type <> 'info' group by room_id) `;
  let joinlatesttbl = " left join " + LASTCONVERTATION + " as lc on lc.room_id = CR.id";

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
    orderQuery = " ORDER BY CR.id desc";
  } else if (searchParams.order_by == "hot") {
    orderQuery = " ORDER BY CR.create_date desc";
  } else if (searchParams.order_by == "location") {
    orderQuery = " ORDER BY CR.create_date asc";
  }

  if (searchParams && searchParams.order_by == "noisy") {
    selectFileds +=
      crstar +
      "," +
      selectUserQuery +
      " COUNT(CM.id) as active_members, getLatestMessageTimeByRoomId(CR.id) as latest_message_time ";
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
    orderQuery = " ORDER BY active_members DESC,latest_message_time desc,CR.create_date desc";
  } else {
    selectFileds +=
      crstar +
      ", " +
      selectUserQuery +
      " countActiveMemberByRoomID(CR.id) as active_members, getLatestMessageTimeByRoomId(CR.id) as latest_message_time ";
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

  if ((searchParams && searchParams.status == "active") || searchParams.status == "deleted") {
    whereQuery += " AND CR.status = ?";
    clauseParams.push(searchParams.status);
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
    whereQuery += " AND  CR.passcode IS NOT NULL AND CR.passcode <> '' ";
  }

  const DAYS7POPULAR = ` left join (SELECT count(id) as day7convertations,  room_id from ${TABLES.CHATROOM_CONVERSATIONS_TABLE} where status = "active" and create_date >= DATE(NOW() - INTERVAL 7 DAY) and content_type <> 'info' group by room_id) as CC on CC.room_id=CR.id `;

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

  const query = `SELECT CR.create_date,CR.group_type,U.name as owner,U.id as owner_user_id,CR.passcode,day7convertations,${selectFileds} FROM ${TABLES.CHATROOMS_TABLE} as CR JOIN ${TABLES.USER_TABLE} AS U ON (U.id=CR.user_id) ${DAYS7POPULAR} ${joinlatesttbl} ${joinCMTables} ${joinCTTables} ${joinCITables} ${whereQuery} ${groupByFileds} ${havingQuery} ${orderQuery} ${limitQuery}`;
  // const result = await executeQueryReader(query, params, function (err, rows) {
  //   console.log(this.sql);
  // });
  const result = await executeQueryReader(query, params);

  return result;
};

export const participantImages = async (room_id) => {
  const query = `SELECT CM.user_id, U.name, U.profile_image, if( U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}", U.default_profile_image)) as default_profile_image FROM ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM JOIN ${TABLES.USER_TABLE} AS U ON (U.id=CM.user_id) WHERE CM.room_id = ?  AND U.status = 'active' ORDER BY CM.create_date DESC`;

  const result = await executeQueryReader(query, room_id);
  return result;
};
