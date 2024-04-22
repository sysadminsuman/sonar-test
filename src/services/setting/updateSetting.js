import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateSetting = async (data, id) => {
  const query = `UPDATE ${TABLES.SETTING_TABLE} SET ? WHERE id=?`;
  return await executeQuery(query, [data, id]);
};
