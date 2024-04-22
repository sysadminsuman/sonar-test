import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// get all chatrooms that user joined
export const getUserChatrooms = async (userid) => {
  const query = `SELECT C.*, CM.id as chatroom_member_id from ${TABLES.CHATROOM_MEMBERS_TABLE} as CM INNER JOIN ${TABLES.CHATROOMS_TABLE} as C ON CM.room_id = C.id where CM.user_id = ? and CM.status <> 'deleted'`;
  const result = await executeQuery(query, userid);
  return result;
};

export const getCountUserChatrooms = async (userid) => {
  const query = `SELECT count(*) AS record_count from ${TABLES.CHATROOM_MEMBERS_TABLE} as CM INNER JOIN ${TABLES.CHATROOMS_TABLE} as C ON CM.room_id = C.id where CM.user_id = ? and CM.status <> 'deleted'`;
  const result = await executeQuery(query, userid);
  return result[0].record_count;
};

export const getCountChatroomMembers = async (roomId) => {
  const query = `SELECT count(*) AS record_count from ${TABLES.CHATROOM_MEMBERS_TABLE} as CM
  INNER JOIN ${TABLES.USER_TABLE} U ON U.id = CM.user_id
  where CM.room_id = ? and CM.status <> 'deleted' and U.status <> 'deleted'`;
  const result = await executeQuery(query, roomId);
  return result[0].record_count;
};
