import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getTagByPagination = async (offSet, limit, filter = {}) => {
  let params = [];
  let orderby = " order by ";

  const DAYS7POPULAR = `(SELECT count(id) as plarity,tag_id from ${TABLES.CHATROOM_TAGS_TABLE} where status = "active" and create_date >= DATE(NOW() - INTERVAL 7 DAY) group by tag_id)`;
  let query = `SELECT id, name FROM ${TABLES.TAG_TABLE} as t `;

  if (filter.order_key) {
    if (filter.order_key == "popular7day") {
      query += `   join ${DAYS7POPULAR} as p on p.tag_id=t.id `;
      orderby += ` p.plarity desc ,`;
    }
  }
  let USEDTAGS = "";
  if (filter.withrooms) {
    if (filter.withrooms == "y") {
      USEDTAGS = ` and t.id in (SELECT distinct t.tag_id
      FROM ${TABLES.CHATROOM_TAGS_TABLE} as t
       join ${TABLES.CHATROOMS_TABLE} as r on r.id = t.room_id  
      where t.status <> "deleated" and r.status <> "deleated" )`;
    }
  }
  orderby += ` t.id asc `;
  query += ` WHERE t.status = 'active' AND t.is_default='y' AND t.name !='여행키워드' ${USEDTAGS} ${orderby} LIMIT ?, ?`;
  params.push(offSet);
  params.push(limit);
  const result = await executeQueryReader(query, params);
  return result;
};
