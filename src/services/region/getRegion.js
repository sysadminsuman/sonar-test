import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getCityByIds = async (cityIds) => {
  const query = `SELECT GROUP_CONCAT(CI.name separator ", ") as city_list, GROUP_CONCAT(DISTINCT C.name separator ", ") as country_list FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.id IN(?) ORDER BY CI.name asc`;
  const result = await executeQueryReader(query, [cityIds]);
  return result[0];
};

export const getCityByIdsbyorder = async (cityIds) => {
  const query = `SELECT GROUP_CONCAT(CI.name ORDER BY FIELD(CI.id, ?)) as city_list, GROUP_CONCAT(DISTINCT C.name separator ", ") as country_list FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.id IN(?) ORDER BY FIELD(CI.id, ?) `;

  const result = await executeQueryReader(query, [cityIds, cityIds, cityIds]);
  return result[0];
};

export const getCityDetailsByIds = async (cityIds) => {
  const query = `SELECT CI.id, CI.name, CI.country_id, C.name as country_name  FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.id IN(?) ORDER BY FIELD(CI.id, ?)`;
  const result = await executeQueryReader(query, [cityIds, cityIds]);
  return result;
};
