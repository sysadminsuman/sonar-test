import { StatusError } from "../../config/index.js";
import { chatService, conversationService } from "../../services/index.js";
import { getCurrentUTCTime, getCurrentTimeStamp, getCurrentDateTime } from "../../helpers/index.js";
/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const reportMessage = async (req, res, next) => {
  try {
    let reqBody = req.body;
    const userDetails = req.userDetails;
    let conversationData = await chatService.getConversationbyID(reqBody.conversation_id);
    const currentTimeStamp = await getCurrentTimeStamp();
    if (!conversationData) throw StatusError.badRequest("conversationNotExist");

    const data = {
      is_reported: 1,
      reported_by: userDetails.userId,
      updated_by: userDetails.userId,
      update_date: await getCurrentDateTime(),
    };
    await conversationService.updateReportChatroomCoversation(data, reqBody.conversation_id);

    let report_id = await conversationService.reportCoversation({
      user_id: userDetails.userId,
      conversation_id: reqBody.conversation_id,
      description: reqBody.description,
      type: reqBody.type,
      create_date: await getCurrentUTCTime(),
    });

    res.status(200).send({
      success: true,
      report_id: report_id,
      conversation_id: reqBody.conversation_id,
      message: res.__("messageReportedSuccessfully"),
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
