import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const getByUsername = async (data) => {
  const query = `SELECT * FROM ${TABLES.USER_TABLE} WHERE username = '${data.username}' AND status <> 'deleted'`;
  const result = await executeQuery(query);
  return result[0];
};
