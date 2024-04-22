import executeQueryReader from "../executeQueryReader.js";
import { TABLES } from "../../utils/constants.js";

export const getTagsByIds = async (tagIds) => {
  const query = `SELECT GROUP_CONCAT(name separator " #") as tag_list FROM ${TABLES.TAG_TABLE}  WHERE status = 'active' AND id IN(?) ORDER BY name asc`;
  const result = await executeQueryReader(query, [tagIds]);
  return result[0].tag_list;
};
export const getTagsBySequenceIds = async (tagIds) => {
  const query = `SELECT id,name    FROM ${TABLES.TAG_TABLE}  WHERE status = 'active' AND id IN(?)  `;
  const result = await executeQueryReader(query, [tagIds]);

  let tags = "";
  let tag_list = [];
  result.map((row) => {
    tag_list[row.id] = row.name;
    return row;
  });

  tagIds.reverse();

  for (const tag_id of tagIds) {
    tags += "#" + tag_list[tag_id];
  }
  return tags;
};

export const getRandomTag = async () => {
  const query = `SELECT name FROM ${TABLES.TAG_TABLE}  WHERE status = 'active' and is_default ='y' ORDER BY RAND() LIMIT 1`;
  const result = await executeQueryReader(query);
  return result[0].name;
};
