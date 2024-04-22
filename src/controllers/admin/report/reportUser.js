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
export const reportUser = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const reason_type = reqBody.reason_type ? reqBody.reason_type : "";
    const chatroomName = reqBody.chatroom_name
      ? reqBody.chatroom_name
          .replace(/["']/g, "")
          .replace(/[.]/g, "\\.")
          .replace(/[,]/g, "\\,")
          .replace(/[%]/g, "\\%")
          .replace(/[_]/g, "\\_")
          .trim()
      : "";
    const group_type = reqBody.group_type ? reqBody.group_type : "";
    const reportedUser = reqBody.reported_user ? reqBody.reported_user : "";
    const reportedBy = reqBody.reported_by ? reqBody.reported_by : "";
    let create_date = "";
    let last_date = "";
    if (reqBody.create_start_date) {
      create_date = dayjs(reqBody.create_start_date).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.create_end_date) {
      last_date = dayjs(reqBody.create_end_date).format("YYYY-MM-DD HH:mm:ss");
    }
    const is_secret = reqBody.is_secret ? reqBody.is_secret : "";
    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;
    let searchParams = {
      reason_type: reason_type,
      chatroomName: chatroomName,
      group_type: group_type,
      reportedUser: reportedUser,
      reportedBy: reportedBy,
      create_start_date: create_date,
      create_end_date: last_date,
      is_secret: is_secret,
    };

    const allReportedUser = await adminService.reportService.getReportUserList(searchParams);
    if (!allReportedUser) throw StatusError.badRequest("ReportedUser-Empty-List");
    const totalReportedUser = allReportedUser.length;
    let pageNo = 1;
    let totalPages = 0;
    let listdata = [];

    if (totalReportedUser > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalReportedUser / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const reportedUserDetails = await adminService.reportService.getReportUserListByPagination(
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
      // data save in an array
      if (reportedUserDetails) {
        for (const user of reportedUserDetails) {
          let reportuserlist = {
            room_id: user.room_id,
            room_name: user.group_name,
            report_reason: user.type,
            report_user: user.posted_by,
            report_by: user.reported_by,
            room_type: user.group_type,
            secret_type: user.passcode,
            reportDate: user.create_date,
            reportBy_userId: user.reportby_userId,
            report_userId: user.postedby_userId,
            reportBy_emailId: user.reportby_emailId,
            report_emailId: user.postedby_emailId,
            reportBy_customer_id: user.repotedby_customer_id,
            report_customer_id: user.postedby_customer_id,
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
