import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const getMediaByPagination = async (room_id, offSet, limit) => {
  const query = `SELECT id,expired,
  IF(expired = 0, file_name, file_name_small) as file_name,
  IF(expired = 0, file_name_medium, file_name_small) as file_name_medium,
  file_name_small   
  FROM (SELECT ca.id,ca.expired,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",ca.file_name)) as file_name,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",if(ca.mime_type = "video",concat(SUBSTRING_INDEX( ca.file_name, '.', 1 ),".png"),ca.file_name)))) as file_name_medium,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",if(ca.mime_type = "video",concat(SUBSTRING_INDEX( ca.file_name, '.', 1 ),".png"),ca.file_name)))) as file_name_small ,
   ca.conversation_id FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} AS ca JOIN ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc ON ca.conversation_id = cc.id 
  WHERE ca.status = 'active' AND cc.status = 'active' AND cc.room_id = ? ORDER BY cc.create_date DESC LIMIT ?, ? ) as x`;

  const result = await executeQueryReader(query, [room_id, offSet, limit]);
  return result;
};

export const getAllMedia = async (room_id, offSet, limit, joindate = null) => {
  let additionalwhr = "";

  let qparams = [room_id, room_id];

  const MEMBERS = `(select id,user_id,status from ${TABLES.CHATROOM_MEMBERS_TABLE}
    where id in
    (SELECT max(id)  FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
    where room_id= ?
    group by  user_id ))`;
  if (joindate != null) {
    additionalwhr = ` and cc.create_date >= ? `;
    qparams.push(joindate);
  }
  qparams.push(offSet);
  qparams.push(limit);
  const query = `SELECT cc.id, cc.content_type, u.name as sender_name,M.status as mstatus,DATE_FORMAT(cc.create_date, '%Y-%m-%d') as added_date,ROUND(UNIX_TIMESTAMP(cc.create_date)*1000) as added_timestamp 
  FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc 
  LEFT JOIN ${TABLES.USER_TABLE} AS u ON u.id = cc.user_id 
  JOIN ${MEMBERS} AS M ON M.user_id=cc.user_id
  WHERE cc.status = 'active' AND cc.room_id = ? 
  AND content_type IN ('image', 'video') AND is_reported = 0 ${additionalwhr}
  ORDER BY cc.create_date DESC LIMIT ?, ?`;

  const result = await executeQueryReader(query, qparams);
  var mediaList = [];
  for (const key in result) {
    let medias = await getConversationMedia(result[key]["id"]);
    if (medias != undefined || medias.length != 0) {
      mediaList[key] = result[key];
      mediaList[key].medias = JSON.stringify(medias);
    }
  }
  return mediaList;
};

export const getConversationMedia = async (conversation_id) => {
  const query = `SELECT id,expired,
  IF(expired = 0, file_name, file_name_small) as file_name,
  IF(expired = 0, file_name_medium, file_name_small) as file_name_medium,
  file_name_small   
  FROM (SELECT ca.id,ca.expired,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",ca.file_name)) as file_name,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",if(ca.mime_type = "video",concat(SUBSTRING_INDEX( ca.file_name, '.', 1 ),".png"),ca.file_name)))) as file_name_medium,
  if(ca.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",if(ca.mime_type = "video",concat(SUBSTRING_INDEX( ca.file_name, '.', 1 ),".png"),ca.file_name)))) as file_name_small
  FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} AS ca  WHERE ca.conversation_id = ? AND ca.status = 'active') as x`;
  const result = await executeQueryReader(query, conversation_id);
  return result;
};

export const getAllMediaDate = async (room_id, offSet, limit, joindate = null) => {
  let additionalwhr = "";
  let qparams = [room_id];
  if (joindate != null) {
    additionalwhr = ` and cc.create_date >= ? `;
    qparams.push(joindate);
  }
  qparams.push(offSet);
  qparams.push(limit);
  const query = `SELECT DISTINCT DATE_FORMAT(cc.create_date, '%Y-%m-%d') as conversation_date FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc WHERE cc.status = 'active' AND cc.room_id = ? AND content_type IN ('image', 'video')  ${additionalwhr} ORDER BY cc.create_date DESC LIMIT ?, ? `;

  const result = await executeQueryReader(query, qparams);
  return result;
};

export const getAllMediaDatewise = async (room_id, conversation_date) => {
  const query = `SELECT cc.id, cc.content_type,u.name as sender_name, M.status as mstatus, DATE_FORMAT(cc.create_date, '%Y-%m-%d') as added_date,ROUND(UNIX_TIMESTAMP(cc.create_date)*1000) as added_timestamp FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} AS cc 
  LEFT JOIN ${TABLES.USER_TABLE} AS u ON u.id = cc.user_id 
  JOIN (select id,user_id,status from ${TABLES.CHATROOM_MEMBERS_TABLE}
    where id in
    (SELECT max(id)  FROM ${TABLES.CHATROOM_MEMBERS_TABLE}
    where room_id= ?
    group by  user_id )) AS M ON M.user_id=cc.user_id
  WHERE cc.status = 'active' AND cc.room_id = ? AND DATE(cc.create_date) = ? AND content_type IN ('image', 'video') AND is_reported = 0 ORDER BY cc.create_date DESC`;
  const result = await executeQueryReader(query, [room_id, room_id, conversation_date]);
  var mediaList = [];
  for (const key in result) {
    let medias = await getConversationMedia(result[key]["id"]);
    mediaList[key] = result[key];
    mediaList[key].medias = JSON.stringify(medias);
  }
  return mediaList;
};
