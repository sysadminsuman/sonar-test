import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

//get tags added by user
export const getUserTagWithSearch = async (searchParams) => {
  const name = searchParams.name;
  const userId = searchParams.user_id;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  let whereQuery = "";
  let params = [];
  whereQuery += ' WHERE t.status <> "deleted" AND t.is_default="n"';
  // search keyword is "re" for name in a tags table search
  if (searchParams.name) {
    whereQuery += ` AND t.name like ? `;
    params.push(`%${name}%`);
  }
  if (searchParams.user_id) {
    whereQuery += ` AND t.created_by= ? `;
    params.push(userId);
  }
  if (searchParams && searchParams.startDate && !searchParams.endDate) {
    whereQuery += ' AND DATE(t.create_date) >= ? ';
    params.push(startDate);
  }
  if (searchParams && searchParams.startDate && searchParams.endDate) {
    whereQuery +=
      'AND DATE(t.create_date) >= ? AND DATE(t.create_date) <= ? ';
      params.push(startDate);
      params.push(endDate);
  }
  if (searchParams && !searchParams.startDate && searchParams.endDate) {
    whereQuery += ' AND DATE(t.create_date) <= ? ';
    params.push(endDate);
  }
  const query = `SELECT t.id, t.name,t.create_date,hct_user.last_create_date as lastUseDate,hct_user.cnt as userCount, (select count(*) FROM ${TABLES.CHATROOM_TAGS_TABLE} as ct WHERE ct.tag_id = t.id) as chatroomCount FROM ${TABLES.TAG_TABLE} as t left join (select count(hct.created_by) as cnt,hct.tag_id,hct.last_create_date from (select ct.tag_id,ct.created_by,max(ct.create_date)as last_create_date from ${TABLES.CHATROOM_TAGS_TABLE} as ct group by ct.tag_id,ct.created_by) hct group by hct.tag_id) hct_user on t.id = hct_user.tag_id ${whereQuery}`;

  const result = await executeQueryReader(query,params);
  return result;
};
