import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const createCountry = async (data) => {
  const query = `INSERT INTO ${TABLES.COUNTRY_TABLE} SET ?`;
  const countryId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return countryId;
};

export const createCity = async (data) => {
  const query = `INSERT INTO ${TABLES.CITY_TABLE} SET ?`;
  const cityId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return cityId;
};
