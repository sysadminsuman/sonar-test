import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Remove device data by uuid for user
export const deleteDevice = async (deviceUuid) => {
  const query = `DELETE FROM ${TABLES.USER_DEVICES} WHERE device_uuid = ?`;
  await executeQuery(query, deviceUuid);
};

export const deleteDeviceOnly = async (deviceUuid) => {
  const query = `DELETE FROM ${TABLES.DEVICE_TABLE} WHERE device_uuid = ?`;
  await executeQuery(query, deviceUuid);
};
