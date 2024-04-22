import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";

// Insert device data if new or update
export const insertOrUpdateDevice = async ({ user_id, device_uuid, device_type, device_token }) => {
  const query = `INSERT INTO ${TABLES.USER_DEVICES} (user_id, device_uuid, device_type, device_token) VALUES( ?, ?, ?, ? ) ON DUPLICATE KEY UPDATE user_id = ?,  device_token = ?`;
  await executeQuery(query, [
    user_id,
    device_uuid,
    device_type,
    device_token,
    user_id,
    device_token,
  ]);
};
