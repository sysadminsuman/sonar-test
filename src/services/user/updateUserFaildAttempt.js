import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateUserFaildAttempt = async (data, id) => {
  const query = `UPDATE ${TABLES.USER_TABLE} SET ? WHERE id=${id}`;
  return await executeQuery(query, data);
};
