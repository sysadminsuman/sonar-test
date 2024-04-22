import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

/**
 * User List
 * @param req
 * @param res
 * @param next
 */
export const getAllApprovalUserList = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    //const searchName = reqBody.searchName ? reqBody.searchName : "";
    const searchEmail = reqBody.email ? reqBody.email : "";
    const product_no = reqBody.product_no ? reqBody.product_no : "";

    let searchParams = {
      // searchName: searchName,
      searchEmail: searchEmail,
      product_no: product_no,
      userType: "super_admin",
    };

    // get count of all user  and details
    const userDetails = await adminService.userService.getCountAllApproveUserList(
      searchParams.userType,
      searchParams,
    );

    if (!userDetails) throw StatusError.badRequest("UsersEmptyList");
    const totalUser = userDetails.length;
    let pageNo = 1;
    let totalPages = 0;
    let data = [];

    if (totalUser > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalUser / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const userAllDetails = await adminService.userService.getAllApproveUserUserByPagination(
        searchParams.userType,
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
      // data save in an array
      if (userAllDetails) {
        for (const user of userAllDetails) {
          let userlist = {
            user_id: user.id,
            email: user.email,
            product_no: user.product_no,
            status: user.status,
            create_date: user.create_date,
            activation_date: user.activation_date,
          };
          data.push(userlist);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalUser,
      user_details: data,
      //  user_id: userDetails.id,
      //  name: userDetails.name,
      //  email: userDetails.email,
    });
  } catch (error) {
    next(error);
  }
};
