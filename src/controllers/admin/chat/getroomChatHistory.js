import { adminService } from "../../../services/index.js";

import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";
import { getUserNameByUserId } from "../../../helpers/index.js";
/**
 * Get User Chat History
 * @param req
 * @param res
 * @param next
 */
export const getroomChatHistory = async (req, res, next) => {
  try {
    const reqBody = req.query;

    // const userDetails = req.userDetails;
    //const chatroomDetails = await adminService.chatService.getByRoomId(reqBody.room_id);
    //if (!chatroomDetails) throw StatusError.badRequest("forbidden");

    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);

    let offSet = 0;

    let params = {
      roomId: reqBody.room_id,
      paginationLimit: paginationLimit,
      offSet: offSet,
    };
    const totalChatConversations =
      await adminService.chatService.getTotalCountCoversationByRoomIdAndTime(reqBody.room_id);

    //const allChatConversations =
    //  await adminService.chatService.getTotalCountCoversationByRoomIdAndTimePagination(params);

    //return false;
    // let chatcount = allChatConversations.length;

    let pageNo = 1;
    let totalPages = 0;
    let data = [];
    if (parseInt(totalChatConversations) > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatConversations / noOfRecordsPerPage);

      offSet = (pageNo - 1) * noOfRecordsPerPage;

      params.offSet = offSet;
      const chatConversations =
        await adminService.chatService.getTotalCountCoversationByRoomIdAndTimePagination(params);

      if (chatConversations) {
        for (const conversation of chatConversations) {
          let username = await getUserNameByUserId(conversation.user_id);
          let info_message = "";
          if (conversation.content_type == "info") {
            info_message = req.__(conversation.message);
            /* conversation.message == "userHasArrived"
                ? "님이 입장했습니다."
                : "님이 퇴장하셨습니다.";*/
          }
          let chatconversation = {
            conversation_id: conversation.id,
            timestamp: dayjs(conversation.create_date).valueOf(),
            content_type: conversation.content_type,
            message:
              conversation.content_type == "info" ? username + info_message : conversation.message,
            url_meta: conversation.url_meta,
            // user_id: conversation.user_id,
            create_date: conversation.create_date,
            user_name: username,
          };

          if (conversation.content_type != "text") {
            const conversationAttachments =
              await adminService.chatService.getConversationAttachments(conversation.id);
            Object.assign(chatconversation, {
              ["attachments"]: JSON.stringify(conversationAttachments),
            });
          }

          if (conversation.is_reaction == "y") {
            const conversationReactions = await adminService.chatService.getConversationReactions(
              conversation.id,
            );
            Object.assign(chatconversation, {
              ["reactions"]: JSON.stringify(conversationReactions),
            });
          }

          // Object.assign(chatconversation, { ["parentData"]: JSON.stringify(parentResponseData) });
          data.push(chatconversation);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatConversations,
      // group_id: chatroomDetails.id,
      // room_unique_id: chatroomDetails.room_unique_id,
      // group_name: chatroomDetails.group_name,
      // group_create_timestamp: dayjs(chatroomDetails.create_date).valueOf(),
      message_list: data,
    });
  } catch (error) {
    //console.log(error);
    next(error);
  }
};
