import { TABLES } from "../../../utils/constants.js";
import executeQueryReader from "../../executeQueryReader.js";

// insert conversation data
export const getReportUserCountListByPagination = async (offSet, limit, searchParams = {}) => {
  let params = [];
  let whereQuery = " 1=1 ";
  let wQuery = "";

  let mtutbl = ` left join (SELECT mu.id,mu.user_id,mu.room_id, u.id as u_id,u.email,u.name as posted_by 
		FROM ${TABLES.CHATROOM_MEMBERS_TABLE} as mu
		left join ${TABLES.USER_TABLE} as u on  mu.user_id= u.id
		   ) as mu  on  mu.user_id = mr.member_id and  mu.room_id = mr.room_id `;

  let memberstbl = ` left join (select name ,email, id FROM ${TABLES.USER_TABLE}     ) as u on u.id = mr.user_id `;

  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.reportedUser) {
    whereQuery += " AND mu.posted_by LIKE ? ";
    params.push(`%${searchParams.reportedUser}%`);
  }
  whereQuery += " AND mr.user_id != mu.u_id ";
  if (searchParams && searchParams.create_start_date && !searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) >= ? ";
    params.push(searchParams.create_start_date);
  }
  if (searchParams && searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) >=? AND DATE(mr.create_date) <= ? ";
    params.push(searchParams.create_start_date);
    params.push(searchParams.create_end_date);
  }
  if (searchParams && !searchParams.create_start_date && searchParams.create_end_date) {
    whereQuery += " AND DATE(mr.create_date) <= ? ";
    params.push(searchParams.create_end_date);
  }

  if (searchParams && searchParams.last_start_date && !searchParams.last_end_date) {
    whereQuery += " AND DATE(mr.create_date) >= ? ";
    params.push(searchParams.last_end_date);
  }

  if (searchParams && searchParams.repoted_count) {
    wQuery += " HAVING  reporteduser_count >= ? ";
    params.push(searchParams.repoted_count);
  }

  const query = `SELECT  COUNT(DISTINCT mr.id) AS reporteduser_count, Max(mr.create_date) as lastreportDate, mr.update_date, mr.updated_by,  u.name as reported_by , mu.posted_by , mr.user_id as reportby_userId, mu.u_id as postedby_userId ,mu.email as postedby_emailId ,u.email as reportby_emailId FROM ${TABLES.CHATROOM_MEMBER_REPORTINGS_TABLE} AS mr ${memberstbl}${mtutbl}  WHERE ${whereQuery} 
  GROUP BY mr.member_id ${wQuery} ORDER BY mr.id DESC LIMIT ?, ?`;
  params.push(offSet);
  params.push(limit);
  const result = await executeQueryReader(query, params);
  return result;
};
