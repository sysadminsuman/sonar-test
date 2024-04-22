import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";
import {
  getCurrentDateTime,
  getCurrentTimeStamp,
  getUserNameByUserId,
} from "../../../helpers/index.js";
/**
 * Get User Chat History
 * @param req
 * @param res
 * @param next
 */
export const getUserChatHistory = async (req, res, next) => {
  try {
    const reqBody = req.query;

    const userDetails = req.userDetails;
    const chatroomDetails = await adminService.chatService.getByRoomId(reqBody.room_id);
    if (!chatroomDetails) throw StatusError.badRequest("forbidden");

    const currentDateTime = await getCurrentDateTime();
    const currentTimeStamp = await getCurrentTimeStamp();

    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    const searchText = reqBody.search_text ? reqBody.search_text : "";
    const searchDateTime = reqBody.timestamp
      ? dayjs(reqBody.timestamp).format("YYYY-MM-DD HH:mm:ss")
      : currentDateTime;
    let resultType = reqBody.result_type ? reqBody.result_type : "";
    let operator = resultType === "next" ? ">" : "<";
    let orderBy = resultType === "next" ? "ASC" : "DESC";
    let offSet = 0;

    let params = {
      roomId: reqBody.room_id,
      userId: userDetails.userId,
      paginationLimit: paginationLimit,
      searchText: searchText,
      searchDateTime: searchDateTime,
      operator: operator,
      orderBy: orderBy,
      offSet: offSet,
    };

    const allChatConversations =
      await adminService.chatService.getTotalChatCoversationByRoomIdAndTime(params);

    let totalChatConversations = allChatConversations.length;

    if (totalChatConversations == 1) {
      if (resultType === "next" && reqBody.is_first_call) {
        resultType = "previous";
        if (searchText == "") {
          operator = "<=";
          orderBy = "DESC";
          params = {
            roomId: reqBody.room_id,
            userId: userDetails.userId,
            paginationLimit: paginationLimit,
            searchText: searchText,
            searchDateTime: searchDateTime,
            operator: operator,
            orderBy: orderBy,
            offSet: offSet,
          };
          const allNextChatConversations =
            await adminService.chatService.getTotalChatCoversationByRoomIdAndTime(params);

          totalChatConversations = allNextChatConversations.length;
        }
      }
    }

    let pageNo = 1;
    let totalPages = 0;
    let data = [];
    if (parseInt(totalChatConversations) > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatConversations / noOfRecordsPerPage);

      offSet = (pageNo - 1) * noOfRecordsPerPage;

      params.offSet = offSet;
      const chatConversations = await adminService.chatService.getUserChatHistoryByPagination(
        params,
      );

      if (chatConversations) {
        for (const conversation of chatConversations) {
          let username = await getUserNameByUserId(conversation.user_id);
          let info_message = "";
          if (conversation.content_type == "info") {
            info_message =
              conversation.message == "userHasArrived"
                ? req.__("userHasArrived")
                : "님이 퇴장하셨습니다.";
          }
          let chatconversation = {
            conversation_recipient_id: conversation.conversation_recipient_id,
            conversation_id: conversation.id,
            timestamp: dayjs(conversation.create_date).valueOf(),
            content_type: conversation.content_type,
            message:
              conversation.content_type == "info" ? username + info_message : conversation.message,
            group_id: chatroomDetails.id,
            user_id: conversation.user_id,
            user_name: username,
          };

          if (conversation.content_type != "text") {
            const conversationAttachments =
              await adminService.chatService.getConversationAttachments(conversation.id);
            Object.assign(chatconversation, {
              ["attachments"]: JSON.stringify(conversationAttachments),
            });
          }

          let parentResponseData = {};
          if (conversation.parent_id) {
            const parentConversations = await adminService.chatService.getConversations(
              conversation.parent_id,
            );

            parentResponseData = {
              conversation_id: parentConversations.id,
              conversation_recipient_id: parentConversations.id,
              timestamp: dayjs(parentConversations.create_date).valueOf(),
              content_type: parentConversations.content_type,
              message: parentConversations.message,
              url_meta: parentConversations.url_meta,
              user_id: parentConversations.user_id,
              user_name: parentConversations.name,
              room_id: parentConversations.room_id,
            };

            if (parentConversations.content_type != "text") {
              const parentConversationAttachments =
                await adminService.chatService.getConversationAttachments(parentConversations.id);
              Object.assign(parentResponseData, {
                ["attachments"]: JSON.stringify(parentConversationAttachments),
              });
            }
          }

          if (conversation.is_reaction == "y") {
            const conversationReactions = await adminService.chatService.getConversationReactions(
              conversation.id,
            );
            Object.assign(chatconversation, {
              ["reactions"]: JSON.stringify(conversationReactions),
            });
          }

          Object.assign(chatconversation, { ["parentData"]: JSON.stringify(parentResponseData) });
          data.push(chatconversation);
        }
      }
    }

    if (totalPages <= pageNo && resultType != "next") {
      let username = await getUserNameByUserId(chatroomDetails.user_id);
      let chatconversation = {
        conversation_recipient_id: 0,
        conversation_id: 0,
        timestamp: dayjs(chatroomDetails.create_date).valueOf(),
        content_type: "info",
        message: res.__("chatroomCreated"),
        group_id: chatroomDetails.id,
        user_id: chatroomDetails.user_id,
        user_name: username,
      };
      let parentResponseData = {};
      Object.assign(chatconversation, { ["parentData"]: JSON.stringify(parentResponseData) });
      data.push(chatconversation);
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatConversations,
      result_type: resultType,
      current_timestamp: currentTimeStamp,
      group_id: chatroomDetails.id,
      room_unique_id: chatroomDetails.room_unique_id,
      group_name: chatroomDetails.group_name,
      group_create_timestamp: dayjs(chatroomDetails.create_date).valueOf(),
      message_list: data,
    });
  } catch (error) {
    next(error);
  }
};
