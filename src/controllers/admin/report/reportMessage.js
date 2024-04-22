import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const reportMessage = async (req, res, next) => {
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
    const reportedMessage = reqBody.reported_message ? reqBody.reported_message : "";

    const reportedBy = reqBody.reported_by ? reqBody.reported_by : "";
    const messagePostedBy = reqBody.message_posted_by ? reqBody.message_posted_by : "";
    const messageType = reqBody.message_type ? reqBody.message_type : "";
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
      reason_type: reason_type,
      chatroomName: chatroomName,
      group_type: group_type,
      reportedMessage: reportedMessage,
      reportedBy: reportedBy,
      messagePostedBy: messagePostedBy,
      messageType: messageType,
      create_start_date: create_date,
      create_end_date: last_date,
    };

    const allReportedMessage = await adminService.reportService.getReportMessageList(searchParams);
    if (!allReportedMessage) throw StatusError.badRequest("ReportedMessage-Empty-List");
    const totalReportedMessage = allReportedMessage.length;
    let pageNo = 1;
    let totalPages = 0;
    let listdata = [];

    if (totalReportedMessage > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalReportedMessage / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const reportedMessageDetails =
        await adminService.reportService.getReportMessageListByPagination(
          offSet,
          noOfRecordsPerPage,
          searchParams,
        );
      // data save in an array
      if (reportedMessageDetails) {
        for (const m_details of reportedMessageDetails) {
          let massage = m_details.message;
          if (m_details.content_type == "image" || m_details.content_type == "video") {
            massage = m_details.file_name_small;
          } else if (m_details.content_type == "emoticon") {
            massage = m_details.emoticon;
          }

          let reportmessagelist = {
            room_id: m_details.chatroom_id,
            room_name: m_details.group_name,
            reportedmessage: massage,
            messagetype: m_details.content_type,
            report_reason: m_details.type,
            posted_by: m_details.posted_by,
            reported_by: m_details.reported_by,
            room_type: m_details.group_type,
            reportDate: m_details.create_date,
            postedby_user_id: m_details.postedby_userId,
            reportby_user_id: m_details.reportby_userId,
            conversation_id: m_details.conversation_id,
            reportby_emailId: m_details.reportby_emailId,
            postedby_emailId: m_details.postedby_emailId,
            reportBy_customer_id: m_details.repotedby_customer_id,
            report_customer_id: m_details.postedby_customer_id,
          };
          listdata.push(reportmessagelist);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalReportedMessage,
      report_details: listdata,
    });
  } catch (error) {
    next(error);
  }
};
