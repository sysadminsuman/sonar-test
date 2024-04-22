import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getClosestRegionData = async (searchParams) => {
  const query = `SELECT C.id, C.latitude, C.longitude, CONCAT(C.name,", ",CN.name) AS name,
  get_distance(?,?,C.latitude,C.longitude) AS distance_km
  FROM ${TABLES.CITY_TABLE} as C
  JOIN ${TABLES.COUNTRY_TABLE} as CN ON C.country_id = CN.id
  WHERE CN.name_en = ?
  HAVING distance_km IS NOT NULL 
  ORDER BY distance_km asc  LIMIT 3 OFFSET 0`;
  const result = await executeQueryReader(query, [
    searchParams.latitude,
    searchParams.longitude,
    searchParams.country,
  ]);
  return result;
};
