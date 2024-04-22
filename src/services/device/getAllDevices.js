import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// Get all device data of particular user
export const getAllDevices = async () => {
  const query = `SELECT device_uuid,device_token,device_type FROM ${TABLES.DEVICE_TABLE} where device_token !=''`;
  const result = await executeQueryReader(query);
  return result;
};
