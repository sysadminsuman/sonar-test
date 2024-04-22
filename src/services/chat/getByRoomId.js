import executeQuery from "../executeQuery.js";
import { TABLES } from "../../utils/constants.js";
import { envs } from "../../config/index.js";
export const getByRoomId = async (roomId) => {
  const query = `SELECT C.*, U.name as username, U.profile_image,
  if(U.default_profile_image = "", "",CONCAT("${envs.aws.cdnpath}",U.default_profile_image)) as default_profile_image,
  IF(C.passcode IS NULL OR passcode = '', false,true) as is_passcode_protected FROM ${TABLES.CHATROOMS_TABLE} AS C JOIN ${TABLES.USER_TABLE} AS U ON U.id=C.user_id WHERE C.id = ? and (C.status <> 'deleted' OR C.is_moderator_left = 1)`;

  const result = await executeQuery(query, roomId);

  return result[0];
};
