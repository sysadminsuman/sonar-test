import { chatMembersService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentUTCTime, getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const reportUser = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    const isExists = await chatMembersService.getChatroomMember(reqBody.room_id, reqBody.member_id);
    const currentTimeStamp = await getCurrentTimeStamp();
    if (!isExists) throw StatusError.badRequest("groupMemberNotExists");

    let report_id = await chatMembersService.reportChatroomMember({
      user_id: userDetails.userId,
      member_id: reqBody.member_id,
      room_id: reqBody.room_id,
      description: reqBody.description,
      type: reqBody.type,
      create_date: await getCurrentUTCTime(),
    });

    res.status(200).send({
      success: true,
      report_id: report_id,
      member_id: reqBody.member_id,
      room_id: reqBody.room_id,
      message: res.__("userReportedSuccessfully"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
