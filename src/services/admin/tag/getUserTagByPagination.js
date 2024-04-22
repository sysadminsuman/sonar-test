import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

//get tags added by user
export const getUserTagByPagination = async (offSet, limit, searchParams) => {
  const name = searchParams.name;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  let whereQuery = "";
  let joinUTables = "";
  let UTwhere = "";
  let UTLEFT = "LEFT";
  let params = [];
  whereQuery += ' WHERE t.status <> "deleted" AND t.is_default="n" ';
  // search keyword is "re" for name in a tags table search
  if (searchParams.name) {
    whereQuery += ` AND t.name like ? `;
    params.push(`%${name}%`);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.user_name) {
    UTLEFT = "";
    UTwhere = ` where ct.created_by in (select id from  ${TABLES.USER_TABLE} where  name LIKE ? and status <> "deleted")`;
    params.push(`%${searchParams.user_name}%`);
  }

  if (searchParams && searchParams.startDate && !searchParams.endDate) {
    whereQuery += " AND DATE(t.create_date) >= ? ";
    params.push(startDate);
  }
  if (searchParams && searchParams.startDate && searchParams.endDate) {
    whereQuery += "AND DATE(t.create_date) >= ? AND DATE(t.create_date) <= ? ";
    params.push(startDate);
    params.push(endDate);
  }
  if (searchParams && !searchParams.startDate && searchParams.endDate) {
    whereQuery += " AND DATE(t.create_date) <= ? ";
    params.push(endDate);
  }

  const query = `select * from ( SELECT t.id, t.name, t.create_date, t.status, hct_user.last_create_date AS lastUseDate, 
  COALESCE(hct_user.cnt, 0) AS userCount, COALESCE(crt.chatroomCount, 0) AS chatroomCount 
  FROM  ${TABLES.TAG_TABLE} AS t 
  ${UTLEFT}  JOIN( 
  SELECT COUNT(hct.created_by) AS cnt, hct.tag_id, hct.last_create_date 
  FROM( SELECT ct.tag_id, ct.created_by, MAX(ct.create_date) AS last_create_date,ct.room_id,ct.status 
  FROM  ${TABLES.CHATROOM_TAGS_TABLE}  AS ct join ${TABLES.CHATROOMS_TABLE} as c on c.id=ct.room_id and c.status <> "deleted"  ${UTwhere} GROUP BY ct.tag_id, ct.created_by) 
  hct GROUP BY hct.tag_id ) hct_user ON t.id = hct_user.tag_id 
  LEFT JOIN( 
  SELECT COUNT(ct.id) AS chatroomCount, ct.tag_id ,ct.status FROM  ${TABLES.CHATROOM_TAGS_TABLE} AS ct 
  join  ${TABLES.CHATROOMS_TABLE} as c on c.id=ct.room_id
  where ct.status <> "deleted" and c.status <> "deleted"
  GROUP BY ct.tag_id ) AS crt 
  ON t.id = crt.tag_id ${joinUTables} ${whereQuery}  
  group by t.id  ORDER BY chatroomCount DESC , t.id ASC) as x  LIMIT ?, ? `;
  params.push(offSet);
  params.push(limit);
  const result = await executeQueryReader(query, params);

  return result;
};
