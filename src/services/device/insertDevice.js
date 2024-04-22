import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert new user
export const insertDevice = async (data) => {
  const query = `INSERT INTO ${TABLES.DEVICE_TABLE} SET ?`;
  const deviceUuid = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return deviceUuid;
};
