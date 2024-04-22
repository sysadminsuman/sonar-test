//import executeQuery from "../../executeQuery.js";
import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";

// insert conversation data
export const getReportUserCountDetailsList = async (searchParams = {}, getId) => {
  let params = [];
  let whereQuery = `1=1 and mr.member_id = ?`;
  params.push(getId);
  let crtbl = `left join (SELECT cr.id,cr.user_id as ct_user_id,cr.group_name, cr.group_type,cr.passcode ,mt.room_id,mt.user_id
	FROM ${TABLES.CHATROOMS_TABLE} as cr  
	left join ${TABLES.CHATROOM_MEMBERS_TABLE} as mt on mt.room_id= cr.id and mt.user_id=cr.user_id
	   
	   ) as cr  on  cr.id = mr.room_id `;

  let mtutbl = ` left join (SELECT mu.id,mu.user_id, u.id as u_id,u.email,u.customer_id as postedby_customer_id,u.name as posted_by ,mu.room_id
	FROM ${TABLES.CHATROOM_MEMBERS_TABLE} as mu
	left join ${TABLES.USER_TABLE} as u on  u.id =  mu.user_id 
	 ) as mu  on  mu.user_id = mr.member_id and  mu.room_id = mr.room_id `;
  let memberstbl = ` left join (select name ,email,customer_id,id FROM ${TABLES.USER_TABLE}      ) as u on u.id = mr.user_id `;

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
    whereQuery += " AND cr.group_name LIKE ?";
    params.push(`%${searchParams.chatroomName}%`);
  }
  if (
    (searchParams && searchParams.group_type == "general") ||
    searchParams.group_type == "location"
  ) {
    whereQuery += " AND cr.group_type = ?";
    params.push(searchParams.group_type);
  }
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.reportedBy) {
    whereQuery += " AND u.name LIKE ?";
    params.push(`%${searchParams.reportedBy}%`);
  }
  if (searchParams && searchParams.is_secret && searchParams.is_secret != "false") {
    whereQuery += " AND  cr.passcode IS NOT NULL AND cr.passcode <> '' ";
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

  if (searchParams && searchParams.last_start_date && !searchParams.last_end_date) {
    whereQuery += " AND DATE(mr.create_date) >=?";
    params.push(searchParams.last_end_date);
  }

  const query = `SELECT mr.room_id, mr.type, mr.description, mr.create_date, mr.update_date, mr.updated_by, cr.group_name, cr.group_type, cr.passcode, u.name as reported_by , mu.posted_by ,
   mr.user_id as reportby_userId ,mu.u_id as postedby_userId ,mu.email as postedby_emailId ,u.email as reportby_emailId ,mu.postedby_customer_id,u.customer_id as repotedby_customer_id
   FROM ${TABLES.CHATROOM_MEMBER_REPORTINGS_TABLE} AS mr ${memberstbl} ${crtbl} ${mtutbl} WHERE  ${whereQuery}  GROUP BY mr.user_id,mr.room_id,mr.type,mr.description, mr.create_date ORDER BY mr.id DESC `;

  const result = await executeQueryReader(query, params);
  return result;
};
