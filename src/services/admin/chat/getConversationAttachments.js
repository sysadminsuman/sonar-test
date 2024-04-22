import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";
import { envs } from "../../../config/index.js";
// get parent conversations details
export const getConversationAttachments = async (conversation_id) => {
  const query = `select id,expired,
  IF(expired = 0, file_name, file_name_small) as file_name,
  IF(expired = 0, file_name_medium, file_name_small) as file_name_medium,
  file_name_small   
  FROM (SELECT c.id,c.expired,  
  if(c.file_name = "", "",CONCAT("${envs.aws.cdnpath}",c.file_name)) as file_name,
  if(c.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",if(c.mime_type = "video",concat(SUBSTRING_INDEX( c.file_name, '.', 1 ),".png"),c.file_name)))) as file_name_medium,
  if(c.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",if(c.mime_type = "video",concat(SUBSTRING_INDEX( c.file_name, '.', 1 ),".png"),c.file_name)))) as file_name_small
  FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE} AS c WHERE c.conversation_id  = ?) as x`;

  const result = await executeQueryReader(query, conversation_id);
  return result;
};
