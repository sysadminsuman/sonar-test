import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

// get member list of particular room
export const getChatroomparticipants = async (roomId) => {
  const query = `SELECT U.*,CM.create_date as participated_date,CM.status as memberStatus, CM.id as member_id, CM.member_type 
  FROM (SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
  where id in(SELECT max(id)
   FROM ${TABLES.CHATROOM_MEMBERS_TABLE} group by room_id,user_id)) AS CM   
  JOIN ${TABLES.USER_TABLE} AS U ON CM.user_id = U.id  WHERE CM.room_id = ? group by user_id order by memberStatus,member_id asc`;

  const result = await executeQueryReader(query, roomId);
  return result;
};

export const getChatroomparticipantsByPagination = async (roomId, offSet, limit) => {
  const query = `SELECT U.*,CM.create_date as participated_date,CM.status as memberStatus, CM.id as member_id, CM.member_type 
  FROM (SELECT * FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
  where id in(SELECT max(id)
   FROM ${TABLES.CHATROOM_MEMBERS_TABLE} group by room_id,user_id)) AS CM   
  JOIN ${TABLES.USER_TABLE} AS U ON CM.user_id = U.id  WHERE CM.room_id = ? group by user_id order by memberStatus, member_id asc LIMIT ?, ?`;

  const result = await executeQueryReader(query, [roomId, offSet, limit]);
  return result;
};
