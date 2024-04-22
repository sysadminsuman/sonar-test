import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
// get chat history with search text
export const getUserLatestChatHistoryByPagination = async (params) => {
  let whereCondition = "";
  //let qparams = [params.roomId, params.roomId, params.userId, params.joindate];
  let qparams = [params.roomId, params.roomId];
  const MEMBERS = `(select id,user_id,status from ${TABLES.CHATROOM_MEMBERS_TABLE}
    where id in
    (SELECT max(id)  FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
    where room_id= ?
    group by  user_id ))`;
  if (params.searchDateTime) {
    whereCondition = ` AND c.create_date ${params.operator} ? `;
    qparams.push(params.searchDateTime);
  }

  if (params.show_previous_chat_history == "n") {
    whereCondition = ` AND c.create_date >= ?`;
    qparams.push(params.joindate);
  }

  if (params.unreadMsgCount && params.resultType == "first") {
    if (
      params.latest_unread_conversation_id > params.latest_read_conversation_id &&
      params.unreadMsgCount <= params.paginationLimit
    ) {
      whereCondition += ` AND c.id <= ? `;
      qparams.push(params.last_unread_conversation_id);
    } else {
      if (params.unreadMsgCount >= params.paginationLimit) {
        whereCondition += ` AND c.id >= ? `;
        qparams.push(params.latest_unread_conversation_id);
      } else {
        if (params.totalLastReadConversations >= params.paginationLimit) {
          whereCondition += ` AND c.id >= ? `;
          qparams.push(params.latest_unread_conversation_id);
        } else {
          whereCondition += ` AND c.id <= ? `;
          qparams.push(params.last_unread_conversation_id);
        }
      }
    }
  }

  if (params.conversation_id) {
    whereCondition += ` AND c.id ${params.operator} ?`;
    qparams.push(params.conversation_id);
  }

  qparams.push(params.offSet);

  qparams.push(params.paginationLimit);

  //console.log(qparams);

  /*const query = `SELECT c.id, c.room_id, c.user_id, U.name as username, M.status as mstatus,c.url_meta, U.profile_image,
  if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image,c.parent_id, c.content_type, c.message,c.is_reaction, c.create_date, c.emoticon_item_id, c.is_reported, c.is_left, cr.id as conversation_recipient_id 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  JOIN ${TABLES.USER_TABLE} AS U ON U.id=c.user_id 
  JOIN ${MEMBERS} AS M ON M.user_id=c.user_id 
  LEFT JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id 
  WHERE c.room_id = ? 
  AND cr.user_id = ?
  AND c.status = 'active'
  AND c.create_date >= ? 
  AND cr.is_deleted = 'n' ${whereCondition} 
  ORDER BY c.id ${params.orderBy} LIMIT ?, ?`;*/
  const query = `SELECT c.id, c.room_id, c.user_id, U.name as username, M.status as mstatus,c.url_meta, U.profile_image,
  if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image,c.parent_id, c.content_type, c.message,c.is_reaction, c.create_date, c.emoticon_item_id, c.is_reported,c.is_notice,c.is_left
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  JOIN ${TABLES.USER_TABLE} AS U ON U.id=c.user_id 
  JOIN ${MEMBERS} AS M ON M.user_id=c.user_id
  WHERE c.room_id = ? 
  AND c.status = 'active' ${whereCondition} 
  ORDER BY c.id ${params.orderBy} LIMIT ?, ?`;
  /*const result = await executeQueryReader(query, qparams, function (err, rows) {
    console.log(this.sql);
  });*/
  const result = await executeQuery(query, qparams);

  return result;
};
