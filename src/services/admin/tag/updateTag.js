import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";

export const updateTag = async (data, id) => {
  const query = `UPDATE ${TABLES.TAG_TABLE} SET ? WHERE id=? `;
  return await executeQuery(query, [data,id]);
};
export const getStatusCount = async () => {
  const query = `SELECT count(t.id) as show_exposed_no  FROM ${TABLES.TAG_TABLE} AS t WHERE t.is_default ="y" and t.status ="active" `;
  const result = await executeQuery(query);
  return result[0].show_exposed_no;
};
