import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getRegionCountData = async (startDate, endDate) => {
  const query = `SELECT count(DISTINCT cm.city) as regionCount FROM ${TABLES.CITY_TABLE} AS c JOIN ${TABLES.CHATROOMS_TABLE} AS cm ON (c.name = cm.city) WHERE DATE(create_date) <= ? AND DATE(create_date)>= ?  AND cm.status <> 'deleted'`;

  const result = await executeQueryReader(query,[startDate,endDate]);
  return result[0];
};
