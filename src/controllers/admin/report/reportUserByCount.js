import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
//import { getCurrentUTCTime } from "../../../helpers/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const reportUserByCount = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const reportedUser = reqBody.reported_user ? reqBody.reported_user : "";
    const repoted_count = reqBody.repoted_count ? reqBody.repoted_count : "";
    let create_date = "";
    let last_date = "";
    if (reqBody.create_start_date) {
      create_date = dayjs(reqBody.create_start_date).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.create_end_date) {
      last_date = dayjs(reqBody.create_end_date).format("YYYY-MM-DD HH:mm:ss");
    }

    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;
    let searchParams = {
      repoted_count: repoted_count,
      reportedUser: reportedUser,
      create_start_date: create_date,
      create_end_date: last_date,
    };

    const allReportedUser = await adminService.reportService.getReportUserCountList(searchParams);
    if (!allReportedUser) throw StatusError.badRequest("ReportedUserCount-Empty-List");
    const totalReportedUser = allReportedUser.length;

    let pageNo = 1;
    let totalPages = 0;
    let listdata = [];

    if (totalReportedUser > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalReportedUser / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const reportedUserDetails =
        await adminService.reportService.getReportUserCountListByPagination(
          offSet,
          noOfRecordsPerPage,
          searchParams,
        );

      // data save in an array
      if (reportedUserDetails) {
        for (const user of reportedUserDetails) {
          let reportuserlist = {
            report_user: user.posted_by,
            report_counts: user.reporteduser_count,
            lastreportDate: user.lastreportDate,
            report_userId: user.postedby_userId,
            report_emailId: user.postedby_emailId,
          };
          listdata.push(reportuserlist);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalReportedUser,
      report_details: listdata,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
