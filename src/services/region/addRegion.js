import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const createChatroomRegion = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_CITIES_TABLE} SET ?`;
  const Id = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return Id;
};
