import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

/**
 * User List
 * @param req
 * @param res
 * @param next
 */
export const getAllUser = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    const searchName = reqBody.searchName ? reqBody.searchName : "";
    //const searchEmail = reqBody.searchEmail ? reqBody.searchEmail : "";
    const customer_id = reqBody.customer_id ? reqBody.customer_id : "";

    let searchParams = {
      searchName: searchName,
      //searchEmail: searchEmail,
      customer_id: customer_id,
      //userType: "user",
    };

    // get count of all user  and details
    const userDetails = await adminService.userService.getCountAllUser(
      reqBody.user_type,
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

      const userAllDetails = await adminService.userService.getAllUserByPagination(
        reqBody.user_type,
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
      // data save in an array
      if (userAllDetails) {
        for (const user of userAllDetails) {
          let userlist = {
            user_id: user.id,
            name: user.name,
            email: user.email,
            customer_id: user.customer_id,
            no_of_chatroom: user.chatroomCount,
            no_of_participant: user.chatroomParticipantCount,
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
