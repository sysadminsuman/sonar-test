import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const deleteTag = async (data, id) => {
  const query = `UPDATE ${TABLES.TAG_TABLE} SET ? WHERE id =${id}`;
  await executeQuery(query, data);
};
