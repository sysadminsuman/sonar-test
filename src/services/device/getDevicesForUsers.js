import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// Get all device data of particular user
export const getDevicesForUsers = async (userIds, notificationType) => {
  let whereCondition = "";

  if (notificationType == "GROUP_CREATED") {
    whereCondition = ` AND u.is_room_creation_notification = 'y' AND u.is_location_enabled = 'y'`;
  } else if (notificationType != "WITHDRAWN" && notificationType != "BATCH_COUNT") {
    whereCondition = ` AND u.is_overall_notification = 'y'`;
  }
  const query = `SELECT * FROM ${TABLES.USER_DEVICES} as ud
  JOIN ${TABLES.USER_TABLE} as u on ud.user_id = u.id
  WHERE user_id IN (?) ${whereCondition} group by ud.device_token`;
  const result = await executeQueryReader(query, [userIds]);
  return result;
};

// Get all device data of particular user_id
export const getDevicesByUserID = async (userId) => {
  const query = `SELECT * FROM ${TABLES.USER_DEVICES} as ud
  JOIN ${TABLES.DEVICE_TABLE} as d on ud.device_uuid = d.device_uuid
  WHERE user_id=? group by ud.device_token`;
  const result = await executeQueryReader(query, [userId]);
  return result;
};
