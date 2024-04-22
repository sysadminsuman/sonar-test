import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";

export const addTagHistory = async (data) => {
  const query = `INSERT INTO ${TABLES.TAG_MODIFICATION_LOG_TABLE} SET ?`;
  const tagId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return tagId;
};
