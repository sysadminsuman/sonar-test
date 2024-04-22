import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";

/**
 * Create Open Chat Group
 * @param req
 * @param res
 * @param next
 */
export const reportMessageDetails = async (req, res, next) => {
  try {
    const reqBody = req.params;

    let reportedMessageData = await adminService.reportService.getReportMessageDetails(
      reqBody.conversation_id,
    );
    if (!reportedMessageData) throw StatusError.notFound("recordNotFound");

    await Promise.all(
      reportedMessageData.conversations.map(async (conversation, index) => {
        conversation.media = await adminService.chatService.getConversationAttachments(
          conversation.id,
        );
        if (conversation.content_type == "info") {
          /*info_message =
				  conversation.message == "userHasArrived"
					? "님이 입장했습니다."
					: "님이 퇴장하셨습니다.";*/
          if (
            conversation.message == "passwordSet" ||
            conversation.message == "passwordChanged" ||
            conversation.message == "passwordRemove"
          ) {
            conversation.message = req.__(conversation.message);
          } else {
            conversation.message = conversation.username + req.__(conversation.message);
          }
        }

        return conversation;
      }),
    );

    return res.status(200).send({
      message_details: reportedMessageData,
    });
  } catch (error) {
    next(error);
  }
};
