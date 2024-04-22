import executeQuery from "../executeQuery.js";
//import { TABLES } from "../../utils/constants.js";

export const createTestProduct = async (data) => {
  const query = `INSERT INTO ht_test_product SET ?`;
  await executeQuery(query, data);
};
