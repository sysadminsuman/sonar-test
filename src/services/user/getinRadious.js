import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

/**
 *  get user details by id
 * @param userId
 */
export const getinRadious = async (latitude, longitude, area_radius, userId) => {
  const query = `SELECT * FROM ${TABLES.USER_TABLE} WHERE
   id <> ? and status <> 'deleted'
   and ? > (ST_Distance_Sphere(
    point(?, ?),
    point(longitude, latitude))/1000)`;

  const result = await executeQueryReader(query, [userId, area_radius, longitude, latitude]);
  return result;
};
