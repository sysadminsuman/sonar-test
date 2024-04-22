import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";

export const getEmoticonsDetails = async () => {
  const query = `SELECT em.id, em.name,CONCAT("${envs.aws.cdnpath}",em.on_image) as on_image, CONCAT("${envs.aws.cdnpath}",em.off_image) as  off_image FROM ${TABLES.EMOTICONS_TABLE} AS em WHERE em.status = 'active'`;

  const result = await executeQuery(query);
  var emoticonList = [];
  for (const key in result) {
    let items = await getEmoticonsItems(result[key]["id"]);
    emoticonList[key] = result[key];
    emoticonList[key].items = items;
  }
  return emoticonList;
};

export const getEmoticonsItems = async (emoticon_id) => {
  const query = `SELECT emt.id, CONCAT("${envs.aws.cdnpath}",emt.image) as image, emt.image_type FROM ${TABLES.EMOTICONS_ITEMS_TABLE} AS emt  WHERE emt.emoticon_id = ? AND emt.status = 'active'`;

  const result = await executeQuery(query, emoticon_id);
  return result;
};

export const getEmoticonsItemsByID = async (id) => {
  const query = `SELECT emt.id, CONCAT("${envs.aws.cdnpath}",emt.image) as image , emt.image_type FROM ${TABLES.EMOTICONS_ITEMS_TABLE} AS emt  WHERE emt.id = ?`;

  const result = await executeQuery(query, id);
  return result[0];
};
