import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get parent conversations details
export const getLatestNoticeByRoomID = async (room_id) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_NOTICES_TABLE}  WHERE room_id = ? AND status='active' AND is_display_chatroom = 'y'`;

  const result = await executeQuery(query, room_id);
  return result[0];
};

export const getNoticesByRoomID = async (room_id, offSet, paginationLimit) => {
  let params = [room_id];
  let limit = "";
  if (paginationLimit) {
    limit = ` LIMIT ?, ?`;
    params.push(offSet);
    params.push(paginationLimit);
  }
  const query = `SELECT n.*,u.id as sender_id,u.name as sender_name FROM ${TABLES.CHATROOM_NOTICES_TABLE} AS n
  left JOIN ${TABLES.USER_TABLE} AS u ON u.id = n.user_id
   WHERE n.room_id   = ? AND n.status='active' ORDER BY id DESC ${limit}`;

  const result = await executeQuery(query, params);
  return result;
};

export const checkTopMostNoticesExists = async (room_id) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_NOTICES_TABLE}  WHERE room_id = ? AND status='active' AND is_display_chatroom = 'y' ORDER BY id DESC`;

  const result = await executeQuery(query, room_id);
  return result;
};

export const getLastNoticesIdByRoomID = async (
  room_id,
  offSet,
  paginationLimit,
  last_notice_id,
) => {
  let params = [room_id];

  let whereCondition = "";

  if (last_notice_id > 0) {
    whereCondition += ` AND n.id < ?`;
    params.push(last_notice_id);
  }
  params.push(offSet);
  params.push(paginationLimit);
  const query = `SELECT n.*,u.id as sender_id,u.name as sender_name,u.profile_image as sender_profile_image FROM ${TABLES.CHATROOM_NOTICES_TABLE} AS n
  left JOIN ${TABLES.USER_TABLE} AS u ON u.id = n.user_id
   WHERE n.room_id   = ? AND n.status='active' ${whereCondition} ORDER BY id DESC LIMIT ?, ?`;
  const result = await executeQuery(query, params);
  return result;
};

export const getNoticeData = async (notice_id) => {
  const query = `SELECT * FROM ${TABLES.CHATROOM_NOTICES_TABLE}  WHERE id = ? AND status='active' ORDER BY id DESC`;

  const result = await executeQuery(query, notice_id);
  return result[0];
};
