import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";
import { envs } from "../../../config/index.js";
// insert conversation data
export const getReportMessageDetails = async (conversation_id) => {
  let crtbl = ` left join (SELECT m.id,m.user_id, m.room_id , m.content_type, m.message ,c.id as chatroom_id ,c.group_name,c.group_type,c.passcode ,u.id as u_id,u.name as posted_by,m.url_meta
	FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as m
	left join ${TABLES.CHATROOMS_TABLE} as c on c.id=m.room_id
	left join ${TABLES.USER_TABLE} as u on u.id= m.user_id
	) as m on  m.id=mr.conversation_id `;

  let memberstbl = ` left join (select name , id FROM ${TABLES.USER_TABLE} WHERE  status <> 'deleted' ) as u on u.id = mr.user_id `;

  const query = `SELECT mr.user_id, m.user_id as member_id,m.room_id,m.group_name, m.message ,m.content_type, mr.type, u.name as reported_by , m.posted_by ,mr.updated_by, m.group_type , mr.create_date, mr.description, mr.conversation_id, mr.update_date,m.url_meta
	FROM ${TABLES.CONVERSATION_REPORTINGS_TABLE} AS mr ${memberstbl} ${crtbl}  WHERE mr.conversation_id = ?`;

  let result = await executeQueryReader(query, conversation_id);
  if (result[0]) {
    const ATTACHMENTS = `(SELECT * FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE}
			where status = "active"
			group by conversation_id)`;

    const msghistory = `
			select m.* ,
			if(a.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",if(a.mime_type = "video",concat(SUBSTRING_INDEX( a.file_name, '.', 1 ),".png"),a.file_name)))) as file_name_small	,
		    CONCAT("${envs.aws.cdnpath}",i.image) as emoticon,
			u.name as username
			from 
			((SELECT ct.* , u.name as user_name ,u.id as u_id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as ct left join ${TABLES.USER_TABLE} as u on u.id= ct.user_id
			where ct.room_id=${result[0].room_id}   and ct.id < ? and ct.content_type <> 'info'
			order by ct.id desc limit 5)
			UNION 
			(SELECT ct.* , u.name as user_name ,u.id as u_id FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as ct left join ${TABLES.USER_TABLE} as u on u.id= ct.user_id
			where ct.room_id=${result[0].room_id}  and ct.id >= ? and ct.content_type <> 'info'
			order by ct.id asc limit 6)) as m
			left join ${ATTACHMENTS} as a on a.conversation_id=m.id
	        left join ${TABLES.EMOTICONS_ITEMS_TABLE} as i on i.id=m.emoticon_item_id
			left join ${TABLES.USER_TABLE} as u on u.id= m.user_id  order by id asc
			`;

    result[0].conversations = await executeQueryReader(msghistory, [
      conversation_id,
      conversation_id,
    ]);
  }

  return result[0];
};
