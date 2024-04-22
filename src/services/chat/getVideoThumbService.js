import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getVideoThumbService = async () => {
  const query = `SELECT cc.id,cca.id as cca_id ,cca.file_name,cca.expired,cca.mime_type from ${TABLES.CHATROOM_CONVERSATIONS_TABLE} cc join ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} cca on cc.id = cca.conversation_id where cc.content_type = "video" and cca.mime_type IS NULL`;

  const result = await executeQueryReader(query);
  return result;
};
