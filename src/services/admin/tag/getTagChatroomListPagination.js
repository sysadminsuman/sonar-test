import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

//Get detail of chatroom by tag id [where tag is used]
export const getTagChatroomListPagination = async (tagID, offSet, limit) => {
  let params = [tagID];
  const query = `SELECT c.id as chatroom_id,ct.id,ct.tag_id,ct.create_date,IFNULL(ct.update_date, ct.create_date) as update_date,c.status,
  c.group_name,c.group_type,c.city,c.country,c.address,c.passcode,u.name as owner,u.id as user_id,countActiveMemberByRoomID(c.id) as participantsCount 
  FROM ${TABLES.CHATROOM_TAGS_TABLE} as ct 
  LEFT JOIN ${TABLES.CHATROOMS_TABLE} as c on ct.room_id=c.id 
  LEFT JOIN ${TABLES.USER_TABLE} as u on c.user_id=u.id WHERE ct.tag_id = ? ORDER BY ct.room_id DESC LIMIT ?, ? `;
  params.push(offSet);
  params.push(limit);
  const result = await executeQueryReader(query, params);
  return result;
};
