import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// Get all device data of particular user
export const getDeviceDetails = async (deviceUuid) => {
  const query = `SELECT * FROM ${TABLES.DEVICE_TABLE} WHERE device_uuid = ?`;
  const result = await executeQueryReader(query, deviceUuid);
  if (result[0]) {
    return result[0];
  } else {
    return 0;
  }
};

// Get all device data of particular user
export const getUserDeviceDetails = async (deviceUuid) => {
  const query = `SELECT ud.device_uuid,u.is_overall_notification,u.is_room_creation_notification,
  u.is_location_enabled FROM ${TABLES.USER_DEVICES} as ud
  JOIN ${TABLES.USER_TABLE} as u on ud.user_id = u.id WHERE ud.device_uuid = ?`;
  const result = await executeQueryReader(query, deviceUuid);
  if (result[0]) {
    return result[0];
  } else {
    return 0;
  }
};
