import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get count all unread message by message id
export const getCountAllUnreadMessagesByUser = async (roomId, userId) => {
  const query = `SELECT count(*) AS unread_count FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
  WHERE c.room_id = ? AND cr.user_id = ? AND c.status = 'active' AND c.content_type <> 'info' AND cr.has_read = 'n' AND cr.is_deleted = 'n'`;
  const result = await executeQueryReader(query, [roomId, userId]);
  return result[0].unread_count;
};

export const getLastUnreadMessageID = async (roomId, userId, orderBy) => {
  const query = `SELECT c.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
  WHERE c.room_id = ${roomId} AND cr.user_id = ${userId} AND c.status = 'active' AND c.content_type <> 'info' AND cr.has_read = 'n' AND cr.is_deleted = 'n' ORDER BY c.id ${orderBy}`;
  const result = await executeQueryReader(query, [roomId, userId, orderBy]);
  if (result[0]) {
    return result[0].id;
  } else {
    return 0;
  }
};

export const getLastReadMessageID = async (roomId, userId) => {
  const query = `SELECT c.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
  WHERE c.room_id = ? AND cr.user_id = ? AND c.status = 'active' AND c.content_type <> 'info' AND cr.has_read = 'y' AND cr.is_deleted = 'n' ORDER BY c.id DESC`;
  const result = await executeQueryReader(query, [roomId, userId]);

  if (result[0]) {
    return result[0].id;
  } else {
    return 0;
  }
};

export const getCountLastReadMessage = async (roomId, userId, last_unread_conversation_id) => {
  const query = `SELECT count(*) AS last_read_count FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS c 
  left JOIN ${TABLES.CHATROOM_CONVERSATION_RECIPIENTS_TABLE} AS cr ON c.id = cr.conversation_id
  WHERE c.room_id = ? AND cr.user_id = ? AND c.status = 'active' AND c.content_type <> 'info' AND cr.has_read = 'y' AND cr.is_deleted = 'n' AND c.id > ?`;
  const result = await executeQueryReader(query, [roomId, userId, last_unread_conversation_id]);

  return result[0].last_read_count;
};
