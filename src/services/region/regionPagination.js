import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const regionSearchByPagination = async (searchKey, offSet, limit) => {
  let params = [];
  let whereQuery = "WHERE 1=1";
  let orderQuery = "ORDER BY CI.name asc";
  let DAYS7POPULAR = "";
  let selectDays7Popular = "";
  // search keyword is "Bo" for name in a city table search & search keyword is "Gh" for name in a countries table search
  if (searchKey && searchKey != "") {
    if (searchKey == "popular7day") {
      DAYS7POPULAR = ` join (SELECT count(A.id) as plarity,A.city_id,MAX(A.create_date) as latest_created_date from ${TABLES.CHATROOM_CITIES_TABLE} as A left join ${TABLES.CHATROOMS_TABLE} B on A.room_id = B.id 
      left join (SELECT count(CM.id) as members,room_id FROM ${TABLES.CHATROOM_MEMBERS_TABLE} AS CM 
    JOIN ${TABLES.USER_TABLE} AS U ON U.id = CM.user_id where CM.status <> "deleted"
       and U.status <> "deleted" group by CM.room_id order by count(CM.id) desc) as CM on CM.room_id=B.id
      where A.status = "active" and B.status = "active" AND CM.members > 0 group by A.city_id) as p on p.city_id=CI.id `;
      orderQuery = "ORDER BY p.plarity desc , p.latest_created_date desc";
      selectDays7Popular = ",p.plarity";
    } else {
      params.push(`%${searchKey}%`);
      params.push(`%${searchKey}%`);
      whereQuery += " AND (CI.name LIKE ? OR C.name LIKE ?)";
    }
  }

  const query = `SELECT CI.id as city_id ${selectDays7Popular} ,CI.name as city_name, C.id as country_id, C.name as country_name, LOWER(C.sortname) as country_sortname, CONCAT('${envs.aws.flgpath}', UPPER(C.sortname), '.gif') as flag_image 
  FROM ${TABLES.CITY_TABLE} AS CI 
  ${DAYS7POPULAR}
  JOIN ${TABLES.COUNTRY_TABLE} AS C ON CI.country_id = C.id ${whereQuery} ${orderQuery} LIMIT ?, ?`;
  params.push(offSet);
  params.push(limit);
  // const result = await executeQueryReader(query, params, function (err, rows) {
  //   console.log(this.sql);
  // });
  const result = await executeQueryReader(query, params);
  return result;
};
