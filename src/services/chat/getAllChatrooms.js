import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

// get all chatrooms
export const getAllChatrooms = async () => {
  const query = `SELECT id, room_unique_id, user_id, group_name, 
  group_image, 
  group_type, latitude, longitude, country, city, address, area_radius, passcode, is_secure_enable, url, last_conversation_id, status, create_date, updated_by, update_date from ${TABLES.CHATROOMS_TABLE}`;
  const result = await executeQueryReader(query);

  return result;
};
