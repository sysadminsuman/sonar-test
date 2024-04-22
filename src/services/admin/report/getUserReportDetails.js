import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";
import { envs } from "../../../config/index.js";
// insert conversation data
export const getUserReportDetails = async (room_id) => {
  let crtbl = `join (SELECT cr.id,cr.user_id as ct_user_id, cr.room_unique_id,cr.group_name, cr.group_type,cr.passcode ,mt.room_id,mt.user_id,if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small 
		FROM ${TABLES.CHATROOMS_TABLE} as cr  
		left join ${TABLES.CHATROOM_MEMBERS_TABLE} as mt on mt.room_id= cr.id and mt.user_id=cr.user_id
		   
		   ) as cr  on  cr.id = mr.room_id `;

  let mtutbl = ` left join (SELECT mu.id,mu.user_id,mu.room_id, u.id as u_id,u.email,u.customer_id as postedby_customer_id,u.name as posted_by 
		FROM ${TABLES.CHATROOM_MEMBERS_TABLE} as mu
		left join ${TABLES.USER_TABLE} as u on  mu.user_id= u.id
		   ) as mu  on  mu.user_id = mr.member_id and  mu.room_id = mr.room_id `;

  let memberstbl = ` left join (select name ,email,customer_id, id FROM ${TABLES.USER_TABLE}     ) as u on u.id = mr.user_id `;

  const query = `SELECT  mr.room_id, mr.type, mr.description, mr.create_date, mr.update_date, mr.updated_by, cr.group_name, cr.group_type,cr.room_unique_id,if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",group_image)) as group_image,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("medium",group_image))) as group_image_medium,
  if(group_image = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",group_image))) as group_image_small , countActiveMemberByRoomID(cr.id) as active_members,IF(cr.passcode IS NULL OR cr.passcode = '', false,true) as is_passcode_protected, u.name as reported_by , mu.posted_by , 
  mr.user_id as reportby_userId, mu.u_id as postedby_userId ,mu.email as postedby_emailId ,u.email as reportby_emailId,mu.postedby_customer_id,u.customer_id as repotedby_customer_id,getLatestMessageTimeByRoomId(cr.id) as latest_message_time 
  FROM ${TABLES.CHATROOM_MEMBER_REPORTINGS_TABLE} AS mr ${memberstbl}${mtutbl} ${crtbl} WHERE  mr.room_id = ?`;

  const result = await executeQueryReader(query, room_id);
  return result[0];
};
