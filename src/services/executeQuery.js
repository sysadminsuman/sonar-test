import util from "util";
import { mysqlConnection } from "../config/index.js";

// bind promise for async query parsing
const executeQuery = util.promisify(mysqlConnection.query).bind(mysqlConnection);

export default executeQuery;
