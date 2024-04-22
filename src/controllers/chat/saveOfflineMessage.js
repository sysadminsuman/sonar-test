import {
  chatService,
  conversationService,
  chatMembersService,
  coversationRecipientService,
} from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import {
  getCurrentUTCTime,
  getCurrentTimeStamp,
  convertTimestampToDateTime,
  getUserNameByUserId,
} from "../../helpers/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import dayjs from "dayjs";
/**
 * Save offline message
 * @param req
 * @param res
 * @param next
 */
export const saveOfflineMessage = async (req, res, next) => {
  try {
    const userDetails = req.userDetails;
    //console.log(req.body);
    const reqBody = req.body;
    var offlineData = JSON.parse(reqBody.offline_data);

    var lastConversationTimestamp = reqBody.last_conversation_timestamp;
    const currentTimeStamp = await getCurrentTimeStamp();
    const paginationLimit = parseInt(PAGINATION_LIMIT);
    const searchText = "";
    const searchDateTime = dayjs(lastConversationTimestamp).format("YYYY-MM-DD HH:mm:ss");
    let resultType = "next";
    let operator = resultType === "next" ? ">" : "<";
    let orderBy = resultType === "next" ? "ASC" : "DESC";
    let offSet = 0;

    let params = {
      userId: userDetails.userId,
      paginationLimit: paginationLimit,
      searchText: searchText,
      searchDateTime: searchDateTime,
      operator: operator,
      orderBy: orderBy,
      offSet: offSet,
    };
    const allChatConversations = await chatService.getTotalChatConversationByUserIdAndTime(params);

    let totalChatConversations = allChatConversations.length;

    let pageNo = 1;
    let totalPages = 0;
    let conversationData = [];
    if (parseInt(totalChatConversations) > 0) {
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatConversations / noOfRecordsPerPage);
      offSet = (pageNo - 1) * noOfRecordsPerPage;
      params.offSet = offSet;
      const chatConversations = await chatService.getUserAllRoomsChatHistoryByPagination(params);

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
            group_id: conversation.room_id,
            user_id: conversation.user_id,
            user_name: username,
          };
          conversationData.push(chatconversation);
        }
      }
    }
    const broadcastDataSender = {
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatConversations,
      current_timestamp: currentTimeStamp,
      message_list: conversationData,
    };

    //console.log(offlineData.length);
    let conversationResponseData = [];
    for (var i = 0; i < offlineData.length; i++) {
      const { room_id, message_id, message, date, parent_message_id, content_type, attachments } =
        offlineData[i];

      const msgDateTime = await convertTimestampToDateTime(date);

      const correntUTC = await getCurrentUTCTime();

      const responseData = {
        conversation_id: message_id,
        conversation_recipient_id: message_id,
        timestamp: currentTimeStamp,
        content_type: content_type != "" ? content_type : "text",
        message,
        user_id: userDetails.userId,
        user_name: userDetails.name,
        room_id,
      };

      const insertMessageData = {
        user_id: userDetails.userId,
        room_id,

        message,
        create_date: correntUTC,
      };
      const [roomDetails, conversationId, memberList] = await Promise.all([
        chatService.getByRoomId(room_id),
        conversationService.createCoversation(insertMessageData),
        chatMembersService.getGroupMembersList(room_id),
      ]);

      let attachment_arr = [];
      if (content_type != "text") {
        for (let i = 0; i < attachments.length; i++) {
          const insertAttachmentData = {
            conversation_id: conversationId,
            file_name: attachments[i],
            create_date: correntUTC,
          };
          const conversationAttachId = await conversationService.createCoversationAttachment(
            insertAttachmentData,
          );
          attachment_arr.push({
            id: conversationAttachId,
            file_name: attachments[i],
          });
        }
      }

      let parentResponseData = {};
      if (parent_message_id) {
        const parentConversations = await chatService.getConversations(parent_message_id);
        parentResponseData = {
          conversation_id: parentConversations.id,
          conversation_recipient_id: parentConversations.id,
          timestamp: dayjs(parentConversations.create_date).valueOf(),
          content_type: parentConversations.content_type,
          message: parentConversations.message,
          user_id: parentConversations.user_id,
          user_name: parentConversations.name,
          room_id: parentConversations.room_id,
        };
        if (parentConversations.content_type != "text") {
          const parentConversationAttachments = await chatService.getConversationAttachments(
            parentConversations.id,
          );
          Object.assign(parentResponseData, {
            ["attachments"]: JSON.stringify(parentConversationAttachments),
          });
        }
      }

      if (content_type != "text") {
        Object.assign(responseData, { ["attachments"]: JSON.stringify(attachment_arr) });
      }

      Object.assign(responseData, { ["parentData"]: JSON.stringify(parentResponseData) });

      conversationResponseData.push(responseData);
      if (!roomDetails) throw StatusError.badRequest("groupNotExists");
      if (memberList.length === 0) throw StatusError.badRequest("groupMemberNotExists");

      const insertRecipientsData = [];
      const updateLastActivityMember = [];
      for (const member of memberList) {
        if (member.id == userDetails.userId) {
          insertRecipientsData.push([member.id, conversationId, "y", msgDateTime]);
        } else {
          insertRecipientsData.push([member.id, conversationId, "n", msgDateTime]);
        }
        updateLastActivityMember.push([member.member_id, msgDateTime]);
      }

      await Promise.all([
        coversationRecipientService.createRecipients(insertRecipientsData),
        // Updating last activity time
        chatMembersService.updateMemberLastActivity(updateLastActivityMember),
      ]);
      //console.log(updateLastActivityMember);
    }

    res.status(200).send({
      success: true,
      user_id: userDetails.userId,
      message: "Data inserted",
      broadcastDataSender: broadcastDataSender,
      conversationResponseData: conversationResponseData,
    });
  } catch (error) {
    next(error);
  }
};
