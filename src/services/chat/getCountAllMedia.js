import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get count for chatroom medias
export const getCountAllMedia = async (room_id) => {
  const query = `SELECT ca.id FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} AS ca JOIN ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc ON ca.conversation_id = cc.id 
  WHERE ca.status = 'active' AND cc.status = 'active' AND cc.room_id = ? ORDER BY cc.create_date DESC`;
  const result = await executeQueryReader(query, room_id);

  return result;
};

export const getAllMediaCount = async (room_id, joinatdate = null) => {
  let additionalwhr = "";
  let qparams = [room_id];

  if (joinatdate != null) {
    additionalwhr = ` and cc.create_date >= ? `;
    qparams.push(joinatdate);
  }
  let query = `SELECT cc.id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc WHERE cc.status = 'active' AND cc.room_id = ? AND content_type IN ('image', 'video') ${additionalwhr} `;

  const result = await executeQueryReader(query, qparams);
  return result;
};

export const getAllMediaCountDate = async (room_id, joinatdate = null) => {
  let additionalwhr = "";
  let qparams = [room_id];
  if (joinatdate != null) {
    additionalwhr = ` and cc.create_date >= ? `;
    qparams.push(joinatdate);
  }
  const query = `SELECT DISTINCT DATE_FORMAT(cc.create_date, '%Y-%m-%d') as added_date FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc WHERE cc.status = 'active' AND cc.room_id = ? AND content_type IN ('image', 'video') ${additionalwhr} `;
  const result = await executeQueryReader(query, qparams);

  return result;
};
