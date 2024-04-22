import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateOpenGroup = async (data, id) => {
  const query = `UPDATE ${TABLES.CHATROOMS_TABLE} SET ? WHERE id=?`;
  return await executeQuery(query, [data, id]);
};
