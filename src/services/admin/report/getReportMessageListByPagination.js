import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";
import { envs } from "../../../config/index.js";
// insert conversation data
export const getReportMessageListByPagination = async (offSet, limit, searchParams = {}) => {
  const ATTACHMENTS = `(SELECT * FROM ${TABLES.CHATROOM_CONVERSATIONS_ATTACHMENTS_TABLE}
		where status = "active"
		group by conversation_id)`;
  let params = [];
  let whereQuery = " 1=1 ";
  let crtbl = ` join (SELECT m.id, m.room_id , m.content_type, m.message ,c.id as chatroom_id ,c.group_name,c.group_type,c.passcode ,u.id as u_id,u.email,u.customer_id as postedby_customer_id,u.name as posted_by ,m.url_meta,
		if(a.file_name = "", "",CONCAT("${envs.aws.cdnpath}",addimagesize("small",if(a.mime_type = "video",concat(SUBSTRING_INDEX( a.file_name, '.', 1 ),".png"),a.file_name)))) as file_name_small	,
		CONCAT("${envs.aws.cdnpath}",i.image) as emoticon
	FROM ${TABLES.CHATROOM_CONVERSATIONS_TABLE} as m
	left join ${ATTACHMENTS} as a on a.conversation_id=m.id
	join ${TABLES.CHATROOMS_TABLE} as c on c.id=m.room_id
	left join ${TABLES.EMOTICONS_ITEMS_TABLE} as i on i.id=m.emoticon_item_id
	left join ${TABLES.USER_TABLE} as u on u.id=m.user_id
	) as m on  m.id=mr.conversation_id `;
  /*
	where m.status <> 'deleted'
	and c.status <> 'deleted'
	and u.status <> 'deleted'
	*/
  let memberstbl = ` left join (select name , email,customer_id,id FROM ${TABLES.USER_TABLE} WHERE  status <> 'deleted' ) as u on u.id = mr.user_id `;

  if (
    (searchParams && searchParams.reason_type == "harmful") ||
    searchParams.reason_type == "illegal" ||
    searchParams.reason_type == "scam" ||
    searchParams.reason_type == "other"
  ) {
    whereQuery += " AND mr.type = ?";
    params.push(searchParams.reason_type);
  }
  // search keyword is "sw" for group_name search
  if (searchParams && searchParams.chatroomName) {
    whereQuery += " AND m.group_name LIKE ?";
    params.push(`%${searchParams.chatroomName}%`);
  }
  if (
    (searchParams && searchParams.group_type == "general") ||
    searchParams.group_type == "location"
  ) {
    whereQuery += " AND m.group_type = ?";
    params.push(searchParams.group_type);
  }
  // search keyword is "Sh" for message in a chatroom_conversations table search
  if (searchParams && searchParams.reportedMessage) {
    whereQuery += " AND m.message LIKE ?";
    params.push(`%${searchParams.reportedMessage}%`);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.reportedBy) {
    whereQuery += " AND u.name LIKE ?";
    params.push(`%${searchParams.reportedBy}%`);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.messagePostedBy) {
    whereQuery += " AND m.posted_by LIKE ?";
    params.push(`%${searchParams.messagePostedBy}%`);
  }
  if (
    (searchParams && searchParams.messageType == "text") ||
    searchParams.messageType == "image" ||
    searchParams.messageType == "video"
  ) {
    whereQuery += " AND m.content_type = ?";
    params.push(searchParams.messageType);
  }

  if (searchParams && searchParams.create_start_date && !searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) >=?";
    params.push(searchParams.create_start_date);
  }
  if (searchParams && searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) >=? AND DATE(mr.create_date) <=?";
    params.push(searchParams.create_start_date);
    params.push(searchParams.create_end_date);
  }
  if (searchParams && !searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) <=?";
    params.push(searchParams.create_end_date);
  }

  const query = `SELECT m.group_name, m.message ,m.content_type, mr.type, u.name as reported_by ,m.posted_by,mr.updated_by, m.group_type , mr.create_date, mr.description, mr.conversation_id, mr.update_date, m.chatroom_id,
  mr.user_id as reportby_userId ,m.u_id as postedby_userId ,file_name_small ,m.email as postedby_emailId ,u.email as reportby_emailId,m.emoticon,m.url_meta,m.postedby_customer_id,u.customer_id as repotedby_customer_id 
	FROM ${TABLES.CONVERSATION_REPORTINGS_TABLE} AS mr ${memberstbl} ${crtbl}  WHERE ${whereQuery} ORDER BY mr.id DESC LIMIT ${offSet}, ${limit}`;

  const result = await executeQueryReader(query, params);
  return result;
};
