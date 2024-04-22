import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateLastActivity = async (currentDateTime, userId) => {
  const query = `UPDATE ${TABLES.USER_TABLE} SET last_activity_date = ? WHERE id = ` + userId + ``;
  await executeQuery(query, currentDateTime);
};
