import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// insert new user
export const createUser = async (data) => {
  const query = `INSERT INTO ${TABLES.USER_TABLE} SET ?`;
  const userId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return userId;
};
