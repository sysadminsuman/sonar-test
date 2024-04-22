import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";

export const createTag = async (data) => {
  const query = `INSERT INTO ${TABLES.TAG_TABLE} SET ?`;
  const tagId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return tagId;
};

export const createChatroomTag = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_TAGS_TABLE} SET ?`;
  const tagId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return tagId;
};
export const getByTagNameCount = async (name) => {
  const query = `SELECT count(id) as tag_count, name FROM ${TABLES.TAG_TABLE} WHERE name = ? and is_default="y" and status <> 'deleted' `;

  const result = await executeQueryReader(query,name);
  return result[0].tag_count;
};
