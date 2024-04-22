import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
// get chat history with search text
export const getUserChatHistoryByPagination = async (params) => {
  let whereCondition = "";

  let qparams = [
    params.roomId,
    params.roomId,
    params.userId,
    params.searchDateTime,
    params.joindate,
    params.offSet,
    params.paginationLimit,
  ];
  const MEMBERS = `(select id,user_id,status from ${TABLES.CHATROOM_MEMBERS_TABLE}
    where id in
    (SELECT max(id)  FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
    where room_id= ?
    group by  user_id ))`;
  /*const query = `SELECT c.id, c.room_id, c.user_id, c.content_type, c.message, c.create_date, cr.id as conversation_recipient_id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id WHERE c.room_id = ${params.roomId} AND cr.user_id = ${params.userId} AND c.status = 'active' AND cr.is_deleted = 'n' ${whereCondition} ORDER BY c.create_date ${params.orderBy} LIMIT ${params.offSet}, ${params.paginationLimit}`;*/

  const query = `SELECT c.id, c.room_id, c.user_id, U.name as username, M.status as mstatus,c.url_meta, U.profile_image,
  if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image,c.parent_id, c.content_type, c.message,c.is_reaction, c.create_date, c.emoticon_item_id, c.is_reported, cr.id as conversation_recipient_id 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  JOIN ${TABLES.USER_TABLE} AS U ON U.id=c.user_id 
  JOIN ${MEMBERS} AS M ON M.user_id=c.user_id 
  LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE c.room_id = ? 
  AND cr.user_id = ?
  AND c.status = 'active' 
  AND c.create_date ${params.operator} ? 
  AND c.create_date >= ?
  AND cr.is_deleted = 'n' ${whereCondition} 
  ORDER BY c.create_date ${params.orderBy} LIMIT ?, ?`;
  const result = await executeQueryReader(query, qparams);

  /* const result = await executeQueryReader(query, qparams, function (err, rows) {
    console.log(this.sql);
    return rows;
  });*/

  return result;
};
