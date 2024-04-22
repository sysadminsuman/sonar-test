import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

/**
 *  get user details by email
 * @param userType
 */
export const getCountAllUser = async (userType, searchParams = {}) => {
  let params = [userType];
  let whereCondition = "";
  let selectFileds = "";
  let customer_id = searchParams.customer_id;
  let memberstbl = ` left join (SELECT count(m.id) as chatroomParticipantCount,m.user_id 
  FROM ${TABLES.CHATROOM_MEMBERS_TABLE} as m
  left join ${TABLES.CHATROOMS_TABLE} as c on c.id=m.room_id
  where m.status <> 'deleted'
  and c.status <> 'deleted'
  group by m.user_id) as m on  m.user_id=u.id `;
  let crtbl = ` left join (select COUNT(id) as chatroomCount,user_id FROM ${TABLES.CHATROOMS_TABLE} WHERE  status <> 'deleted'  group by  user_id) as r on r.user_id = u.id `;
  // search keyword is "sa" for name in a user table search
  if (searchParams && searchParams.searchName) {
    whereCondition += " AND name LIKE ? ";
    params.push(`%${searchParams.searchName}%`);
  }
  // search keyword is "sa" for email in a user table search
  // if (searchParams && searchParams.searchEmail) {
  //   selectFileds += ' AND email LIKE "%' + searchParams.searchEmail + '%" ';
  // }

  if (searchParams && searchParams.customer_id) {
    selectFileds += ` AND u.customer_id =  ?  `;
    params.push(customer_id);
  }

  const query = `SELECT  u.id,u.name,u.email,u.customer_id,
  r.chatroomCount ,
  m.chatroomParticipantCount  
  FROM ${TABLES.USER_TABLE} AS u 
  ${memberstbl}
  ${crtbl}
  WHERE u.user_type = ? ${whereCondition} AND u.status <>'deleted' ${selectFileds} 
  GROUP bY u.id ORDER BY u.id DESC `;

  const result = await executeQueryReader(query, params);

  return result;
};
