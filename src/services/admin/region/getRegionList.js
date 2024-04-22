import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getRegionList = async (searchKey) => {
  let whereQuery = "WHERE 1=1";
  let params = [];
  // search keyword is "Bo" for name in a city table search & search keyword is "Gh" for name in a countries table search
  if (searchKey && searchKey != "") {
    whereQuery += ' AND (CI.name LIKE ? OR C.name LIKE ?)';
    params.push(`%${searchKey}%`);
    params.push(`%${searchKey}%`);
  }
  const query = `SELECT CI.id,concat(CI.name ,",", C.name) as name FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) ${whereQuery}`;
  const result = await executeQueryReader(query,params);

  return result;
};
export const getRegionListcount = async (searchKey) => {
  let whereQuery = "WHERE 1=1";
  let params = [];
   // search keyword is "Bo" for name in a city table search & search keyword is "Gh" for name in a countries table search
  if (searchKey && searchKey != "") {
    whereQuery += ' AND (CI.name LIKE ? OR C.name LIKE ? )';
    params.push(`%${searchKey}%`);
    params.push(`%${searchKey}%`);
  }
  const query = `SELECT count(CI.id) as count  FROM ${TABLES.CITY_TABLE} AS CI left JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) ${whereQuery}`;
  const result = await executeQueryReader(query,params);
  return result[0].count;
};
