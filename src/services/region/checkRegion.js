import executeQueryReader from "../executeQueryReader.js";
import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { getCurrentDateTime } from "../../helpers/index.js";

export const checkCountryRegion = async (country) => {
  const query = `SELECT COUNT(*) AS count,id FROM ${
    TABLES.COUNTRY_TABLE
  } WHERE name = '${country.trim()}'`;

  const result = await executeQueryReader(query);
  return result[0];
};

export const checkCityRegion = async (searchParams = {}) => {
  let qparams = [];
  /*const query = `SELECT COUNT(*) AS count,id FROM ${
    TABLES.CITY_TABLE
  }  WHERE LOWER(name_en) = '${searchParams.city.trim()}'`;*/
  let selectFileds = "";
  let selectDuplicateFileds = "";
  /*const query = `SELECT COUNT(*) AS count,CI.id FROM ${TABLES.CITY_TABLE} AS CI JOIN ${
    TABLES.COUNTRY_TABLE
  } AS C ON (C.id=CI.country_id) WHERE LOWER(CI.name_en) = '${searchParams.city.trim()}' AND LOWER(C.name_en) = '${searchParams.country.trim()}'`;*/
  //state_name_en
  const query = `SELECT COUNT(*) AS count,CI.id,CI.state_name_en,C.name as country FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.name_en = ? `;

  const result = await executeQueryReader(query, searchParams.city.trim());

  if (result[0].count > 1) {
    if (searchParams && searchParams.latitude && searchParams.longitude) {
      selectFileds += ", get_distance(?,?,CI.latitude,CI.longitude) AS distance ";
      qparams.push(searchParams.latitude);
      qparams.push(searchParams.longitude);
    }
    qparams.push(searchParams.city.trim());
    const duplicateQuery = `SELECT CI.id AS count,CI.id,CI.name_en_hnt,CI.latitude,CI.longitude ${selectFileds}  FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.name_en = ? ORDER BY distance,CI.id`;
    const resultDuplicate = await executeQueryReader(duplicateQuery, qparams);

    if (resultDuplicate.length > 1) {
      qparams = [searchParams.latitude, searchParams.longitude, searchParams.city.trim()];
      selectDuplicateFileds += ", get_distance(?,?,CI.latitude,CI.longitude) AS distance ";
      const duplicateCityQuery = `SELECT GROUP_CONCAT(CI.id) AS cities_id,GROUP_CONCAT(CI.name_en_hnt,'/',CI.city_code) as duplicate_cities,CONCAT(CI.latitude,',',CI.longitude) as duplicate_latitude_longitude,CI.id ${selectDuplicateFileds}  FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) WHERE CI.name_en = ? GROUP BY distance HAVING COUNT(*) > 1 ORDER BY distance`;
      const resultCityDuplicate = await executeQueryReader(duplicateCityQuery, qparams);

      /*checkDuplicateLogQuery = `SELECT id FROM ${TABLES.CITIES_CHECKING_LOGS_TABLE} WHERE cities_id='${searchParams.city.trim()}'`;*/
      if (resultCityDuplicate.length > 0) {
        const cities_id = resultCityDuplicate[0].cities_id;
        let data = {
          cities_id: cities_id,
          calling_latitude_longitude: searchParams.latitude + "," + searchParams.longitude,
          duplicate_cities: resultCityDuplicate[0].duplicate_cities,
          duplicate_latitude_longitude: resultCityDuplicate[0].duplicate_latitude_longitude,
          exposed_city: resultDuplicate[0].name_en_hnt,
          created_by: searchParams.user_id,
          create_date: await getCurrentDateTime(),
        };
        const insertCityLogquery = `INSERT INTO ${TABLES.CITIES_CHECKING_LOGS_TABLE} SET ?`;
        const CityLogId = await executeQuery(insertCityLogquery, data).then(function (result) {
          return result.insertId;
        });
      }
    }
    return resultDuplicate[0];
  } else {
    return result[0];
  }
};
