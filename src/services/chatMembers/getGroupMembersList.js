import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";

// get member list of particular room
export const getGroupMembersList = async (roomId, userId = 0) => {
  let orderQuery = "";
  let params = [];
  params.push(roomId);
  if (userId) {
    orderQuery = " (CM.user_id= ? ) desc, ";
    params.push(userId);
  }

  const query = `SELECT U.*,U.profile_image,if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image, CM.is_online, CM.id as member_id, CM.member_type, CM.is_enable_notification FROM ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM LEFT JOIN ${TABLES.USER_TABLE} AS U ON CM.user_id = U.id WHERE CM.room_id =  ? and CM.status <> 'deleted' ORDER BY ${orderQuery} CM.member_type DESC, U.name ASC`;
  const result = await executeQuery(query, params);

  return result;
};

export const getNextGroupMember = async (roomId) => {
  const query = `SELECT CM.id,CM.user_id FROM ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM
  WHERE CM.room_id = ? and CM.status = 'active' and CM.member_type = 'member' ORDER BY CM.id ASC LIMIT 1`;
  const result = await executeQuery(query, roomId);
  return result[0];
};

export const checkOwnerGroupMember = async (roomId, userId) => {
  const query = `SELECT COUNT(*) AS count FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id = ? and user_id = ? and member_type = 'owner' and status = 'active' `;
  const result = await executeQuery(query, [roomId, userId]);
  return result[0].count;
};

export const getnotificationStatus = async (roomId, userId = 0) => {
  const query = `SELECT is_enable_notification FROM ${TABLES.CHATROOM_MEMBERS_TABLE} WHERE room_id = ? AND user_id = ?`;

  const result = await executeQuery(query, [roomId, userId]);
  return result[0].is_enable_notification;
};
