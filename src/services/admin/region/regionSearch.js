import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

export const getRegionData = async (searchKey) => {
  let whereQuery = "WHERE 1=1";
  let params = [];
  // search keyword is "Bo" for name in a city table search & search keyword is "Gh" for name in a countries table search
  if (searchKey && searchKey != "") {
    whereQuery += ' AND (CI.name LIKE ? OR C.name LIKE ?)';
    params.push(`%${searchKey}%`);
    params.push(`%${searchKey}%`);
  }
  const query = `SELECT CI.id,CI.country_id,CI.name as city_name,CI.is_default,C.sortname, C.name as country_name,(select COUNT(*) FROM ${TABLES.CHATROOMS_TABLE} as ct WHERE ct.city LIKE CI.name AND ct.country LIKE C.name)as chatroomCount ,(select COUNT(*) FROM ${TABLES.CHATROOM_MEMBERS_TABLE} as cmr WHERE cmr.room_id IN(SELECT id from ${TABLES.CHATROOMS_TABLE} as cc WHERE cc.city LIKE CI.name AND cc.country LIKE C.name))as chatroomParticipantCount FROM ${TABLES.CITY_TABLE} AS CI JOIN ${TABLES.COUNTRY_TABLE} AS C ON (C.id=CI.country_id) ${whereQuery}`;
  const result = await executeQueryReader(query,params);

  return result;
};
