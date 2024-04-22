import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const getTemplate = async (type) => {
  const query = `SELECT * FROM  ${TABLES.NOTIFICATION_TEMPLATE} WHERE type = ? and status = 'active' `;
  const result = await executeQuery(query, type);
  console.log(query);
  return result[0];
};
