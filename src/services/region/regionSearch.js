import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getRegionData = async (searchKey) => {
  let params = [];
  let whereQuery = "WHERE 1=1";
  let DAYS7POPULAR = "";
  // search keyword is "Bo" for name in a city table search & search keyword is "Gh" for name in a countries table search
  if (searchKey && searchKey != "") {
    if (searchKey == "popular7day") {
      // orderQuery = "ORDER BY p.plarity desc , CI.name asc";
      DAYS7POPULAR = ` join (SELECT count(id) as plarity,city_id from ${TABLES.CHATROOM_CITIES_TABLE} where status = "active" and create_date >= DATE(NOW() - INTERVAL 7 DAY) group by city_id) as p on p.city_id=CI.id `;
    } else {
      params.push(`%${searchKey}%`);
      params.push(`%${searchKey}%`);
      whereQuery += " AND (CI.name LIKE ? OR C.name LIKE ?)";
    }
  }
  const query = `SELECT * FROM ${TABLES.CITY_TABLE} AS CI   ${DAYS7POPULAR} JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) ${whereQuery}`;

  const result = await executeQueryReader(query, params);
  return result;
};
