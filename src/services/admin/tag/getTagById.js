import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

//Get details by tag id
export const getTagById = async (tagID) => {
  const query = `SELECT t.id, t.name,t.create_date,t.is_default,t.status,hct_user.last_create_date as lastUseDate,hct_user.cnt as userCount, (select count(*) FROM ${TABLES.CHATROOM_TAGS_TABLE} as ct WHERE ct.tag_id = t.id) as chatroomCount FROM ${TABLES.TAG_TABLE} as t left join (select count(hct.created_by) as cnt,hct.tag_id,hct.last_create_date from (select ct.tag_id,ct.created_by,max(ct.create_date)as last_create_date from ${TABLES.CHATROOM_TAGS_TABLE} as ct group by ct.tag_id,ct.created_by) hct group by hct.tag_id) hct_user on t.id = hct_user.tag_id WHERE t.id = ? AND t.status <> 'deleted' `;
  const result = await executeQueryReader(query,tagID);

  return result[0] ? result[0] : "";
};
