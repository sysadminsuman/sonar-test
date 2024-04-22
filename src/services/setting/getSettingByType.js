import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// Get all device data of particular user
export const getSettingByType = async (type, searchDateTime) => {
  let whereQuery = "";
  let params = [];
  params.push(type);
  if (searchDateTime) {
    whereQuery += ` AND end_maintenance > ?`;
    params.push(searchDateTime);
  }

  const query = `SELECT * FROM ${TABLES.SETTING_TABLE} WHERE type = ? ${whereQuery}`;
  /*const result = await executeQueryReader(query, params, function (err, rows) {
    console.log(this.sql);
  });*/
  const result = await executeQueryReader(query, params);
  if (result[0]) {
    return result[0];
  } else {
    return 0;
  }
};
