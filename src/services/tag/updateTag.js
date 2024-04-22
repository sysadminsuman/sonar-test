import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateTag = async (data, id) => {
  const query = `UPDATE ${TABLES.TAG_TABLE} SET ? WHERE id=${id}`;
  return await executeQuery(query, data);
};
