import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert new user
export const addNotFoundCityRegion = async (data) => {
  const query = `INSERT INTO ${TABLES.CITIES_NOT_FOUND_LOGS_TABLE} SET ?`;
  const id = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return id;
};
