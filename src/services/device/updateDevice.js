import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

export const updateDevice = async (data, deviceUuid) => {
  const query = `UPDATE ${TABLES.DEVICE_TABLE} SET ? WHERE device_uuid=?`;
  return await executeQuery(query, [data, deviceUuid]);
};

export const updateAllDevice = async () => {
  const query = `UPDATE ${TABLES.DEVICE_TABLE} SET system_popup_today_dt = NULL,system_popup_close_dt = NULL`;
  return await executeQuery(query);
};
