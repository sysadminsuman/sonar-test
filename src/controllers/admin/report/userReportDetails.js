import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const userReportDetails = async (req, res, next) => {
  try {
    const reqBody = req.params;

    let reportedMessageData = await adminService.reportService.getUserReportDetails(
      reqBody.room_id,
    );
    if (!reportedMessageData) throw StatusError.notFound("recordNotFound");

    let reportuserlist = {
      room_id: reportedMessageData.room_id,
      room_name: reportedMessageData.group_name,
      report_reason: reportedMessageData.type,
      report_user: reportedMessageData.posted_by,
      report_by: reportedMessageData.reported_by,
      room_type: reportedMessageData.group_type,
      secret_type: reportedMessageData.passcode,
      reportDate: reportedMessageData.create_date,
      reportBy_userId: reportedMessageData.reportby_userId,
      report_userId: reportedMessageData.postedby_userId,
      reportBy_emailId: reportedMessageData.reportby_emailId,
      report_emailId: reportedMessageData.postedby_emailId,
      reportBy_customer_id: reportedMessageData.repotedby_customer_id,
      report_customer_id: reportedMessageData.postedby_customer_id,
      report_detail: reportedMessageData.description,
    };
    return res.status(200).send({
      message_details: reportuserlist,
    });
  } catch (error) {
    next(error);
  }
};
