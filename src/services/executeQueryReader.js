import util from "util";
import { mysqlConnectionReader } from "../config/index.js";

// bind promise for async query parsing
const executeQueryReader = util.promisify(mysqlConnectionReader.query).bind(mysqlConnectionReader);

export default executeQueryReader;
