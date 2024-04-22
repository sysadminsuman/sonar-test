import executeQueryReader from "../../executeQueryReader.js";
import { TABLES } from "../../../utils/constants.js";

/**
 *  get user details by email
 * @param userType
 */
export const getAllApproveUserUserByPagination = async (
  userType,
  offSet,
  limit,
  searchParams = {},
) => {
  let params = [userType];
  let whereCondition = "";
  let selectFileds = "";
  let product_no = searchParams.product_no;

  // search keyword is "sa" for name in a user table search
  // if (searchParams && searchParams.searchName) {
  //   whereCondition += " AND u.name LIKE ? ";
  //   params.push(`%${searchParams.searchName}%`);
  // }
  // search keyword is "sa" for email in a user table search
  if (searchParams && searchParams.searchEmail) {
    selectFileds += ' AND u.email LIKE "%' + searchParams.searchEmail + '%" ';
  }

  if (searchParams && searchParams.product_no) {
    selectFileds += ` AND u.product_no =  ? `;
    params.push(product_no);
  }

  const query = `SELECT  u.id,u.name,u.email,u.product_no,u.status,u.update_date as activation_date,u.create_date as create_date
  FROM ${TABLES.USER_TABLE} AS u 
  WHERE u.user_type = ? ${whereCondition}  ${selectFileds} 
  ORDER BY u.id DESC LIMIT ?, ? `;
  params.push(offSet);
  params.push(limit);
  // const result = await executeQueryReader(query, params, function (err, rows) {
  //   console.log(this.sql);
  // });
  const result = await executeQueryReader(query, params);

  return result;
};
