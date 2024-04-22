import executeQueryReader from "../executeQueryReader.js";

// Get push notification details by type
export const getTemplate = async (type) => {
  const query = `SELECT * FROM ht_notification_templates WHERE type = ? and status = 'active'`;
  const result = await executeQueryReader(query, type);
  return result[0];
};
