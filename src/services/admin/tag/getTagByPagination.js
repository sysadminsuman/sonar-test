import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getTagByPagination = async (offSet, limit, searchParams) => {
  const name = searchParams.name;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  const status = searchParams.status;
  const startRange = searchParams.startRange;
  const endRange = searchParams.endRange;

  let whereQuery = "";
  let selectUserQuery = "";
  let params = [];
  whereQuery += ' WHERE t.status <> "deleted" AND t.is_default="y"';
  // search keyword is "re" for name in a tags table search
  if (searchParams.name) {
    whereQuery += ` AND t.name like ? `;
    params.push(`%${name}%`);
  }
  if (searchParams.status) {
    whereQuery += ` AND t.status = ? `;
    params.push(status);
  }
  if (searchParams && searchParams.startDate && !searchParams.endDate) {
    whereQuery += " AND DATE(last_create_date) >= ? ";
    params.push(startDate);
  }
  if (searchParams && searchParams.startDate && searchParams.endDate) {
    whereQuery += " AND DATE(last_create_date) >= ? AND DATE(last_create_date) <= ? ";
    params.push(startDate);
    params.push(endDate);
  }
  if (searchParams && !searchParams.startDate && searchParams.endDate) {
    whereQuery += " AND DATE(last_create_date) <= ? ";
    params.push(endDate);
  }
  if (startRange == 0 && endRange > 0) {
    selectUserQuery += `HAVING chatroomCount >= 0 AND chatroomCount <= ? `;

    params.push(endRange);
  } else if (startRange > 0 && endRange > 0) {
    selectUserQuery += "HAVING chatroomCount BETWEEN ? AND ? ";

    params.push(startRange);
    params.push(endRange);
  }
  
  const query = `SELECT t.id, t.name, t.create_date, t.status, hct_user.last_create_date AS lastUseDate, 
  COALESCE(hct_user.cnt, 0) AS userCount, COALESCE(crt.chatroomCount, 0) AS chatroomCount 
  FROM ${TABLES.TAG_TABLE} AS t 
  LEFT JOIN( 
  SELECT COUNT(hct.created_by) AS cnt, hct.tag_id, hct.last_create_date ,hct.room_id ,hct.status
  FROM( SELECT ct.tag_id, ct.created_by, MAX(ct.create_date) AS last_create_date ,ct.room_id,ct.status
  FROM   ${TABLES.CHATROOM_TAGS_TABLE} AS ct  join  ${TABLES.CHATROOMS_TABLE} as c on c.id=ct.room_id where c.status <> "deleted" GROUP BY ct.tag_id, ct.created_by) hct
  GROUP BY hct.tag_id 
  ) hct_user ON t.id = hct_user.tag_id 
  LEFT JOIN( SELECT COUNT(*) AS chatroomCount, ct.tag_id, ct.status FROM ${TABLES.CHATROOM_TAGS_TABLE} AS ct 
  join  ${TABLES.CHATROOMS_TABLE} as c on c.id=ct.room_id
  where ct.status <> "deleted" and c.status <> "deleted" GROUP BY tag_id ) AS crt ON t.id = crt.tag_id  ${whereQuery}  ${selectUserQuery} ORDER BY t.status,chatroomCount DESC , t.id ASC  LIMIT ? , ? `;
  params.push(offSet);
  params.push(limit);
  const result = await executeQueryReader(query, params);

  return result;
};
