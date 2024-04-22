import executeQuery from "../executeQuery.js";
import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const createTag = async (data) => {
  const squery = `select id from ${TABLES.TAG_TABLE} where status <> "deleted" and name = ? `;
  const result = await executeQueryReader(squery, data.name);
  let tagId = 0;
  if (result[0] && result[0].id > 0) {
    tagId = result[0].id;
  } else {
    const query = `INSERT INTO ${TABLES.TAG_TABLE} SET ?`;
    tagId = await executeQuery(query, data).then(function (result) {
      return result.insertId;
    });
  }

  return tagId;
};

export const createChatroomTag = async (data) => {
  const query = `INSERT INTO ${TABLES.CHATROOM_TAGS_TABLE} SET ?`;
  const tagId = await executeQuery(query, data).then(function (result) {
    return result.insertId;
  });
  return tagId;
};
