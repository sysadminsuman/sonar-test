import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";

export const deleteTag = async (data, id) => {
  const query = `UPDATE ${TABLES.TAG_TABLE} SET ? WHERE id = ? `;
  await executeQuery(query, [data,id]);
};

export const deleteuserTag = async (data, id) => {
  let query = ` UPDATE ${TABLES.TAG_TABLE} SET ? WHERE id = ? `;
  await executeQuery(query, [data,id]);
  query = `UPDATE ${TABLES.CHATROOMS_TABLE} SET ? WHERE id in (SELECT room_id FROM ${TABLES.CHATROOM_TAGS_TABLE} where tag_id= ? )`;
  await executeQuery(query, [data,id]);
  query=`UPDATE ${TABLES.CHATROOM_MEMBERS_TABLE} SET ? WHERE room_id in (SELECT room_id FROM ${TABLES.CHATROOM_TAGS_TABLE} where tag_id= ? )`;
  await executeQuery(query, [data,id]);
};
