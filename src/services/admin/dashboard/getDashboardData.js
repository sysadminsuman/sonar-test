import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getDashboardData = async (startDate, endDate) => {
  const query = `SELECT count(*) as newChatRoomCount from ${TABLES.CHATROOMS_TABLE} WHERE  DATE(create_date) <= ? AND DATE(create_date)>= ? AND status ='active'`;
  const result = await executeQueryReader(query,[startDate, endDate]);

  return result[0];
};
