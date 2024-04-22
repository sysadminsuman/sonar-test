import { chatService, chatMembersService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import dayjs from "dayjs";
import { getCurrentDateTime, getCurrentTimeStamp, getRandomNumbers } from "../../helpers/index.js";
import { USERLIST, ROOMLIST } from "../../utils/loadTesting.js";
/**
 * Get User Chat History
 * @param req
 * @param res
 * @param next
 */
export const getUserChatHistory = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    const userInt = getRandomNumbers(1, 20);
    const rndInt = getRandomNumbers(1, 10);
    ///const userDetails = req.userDetails;
    const room_id = ROOMLIST[rndInt];
    const user_id = USERLIST[userInt];

    // const room_id = 16;
    // const user_id = 2;
    const chatroomDetails = await chatService.getByRoomId(room_id);
    if (!chatroomDetails) throw StatusError.badRequest("forbidden");
    const member = await chatMembersService.getChatroomMember(room_id, user_id);
    if (!member) throw StatusError.badRequest("memberNotExistsInRoom");
    const currentDateTime = await getCurrentDateTime();
    const currentTimeStamp = await getCurrentTimeStamp();

    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);
    const searchText = reqQuery.search_text ? reqQuery.search_text : "";
    const searchDateTime = reqQuery.timestamp
      ? dayjs(reqQuery.timestamp).format("YYYY-MM-DD HH:mm:ss")
      : currentDateTime;
    let resultType = reqQuery.result_type ? reqQuery.result_type : "";
    let operator = resultType === "next" ? ">" : "<";
    let orderBy = resultType === "next" ? "ASC" : "DESC";
    let offSet = 0;
    let joindate = dayjs(member.create_date).format("YYYY-MM-DD HH:mm:ss");
    let params = {
      roomId: room_id,
      userId: user_id,
      paginationLimit: paginationLimit,
      searchText: searchText,
      searchDateTime: searchDateTime,
      operator: operator,
      orderBy: orderBy,
      offSet: offSet,
      joindate: joindate,
    };

    const allChatConversations = await chatService.getTotalChatCoversationByRoomIdAndTime(params);

    let totalChatConversations = allChatConversations.length;

    if (totalChatConversations == 1) {
      if (resultType === "next" && reqQuery.is_first_call) {
        resultType = "previous";
        if (searchText == "") {
          operator = "<=";
          orderBy = "DESC";
          params = {
            roomId: room_id,
            userId: user_id,
            paginationLimit: paginationLimit,
            searchText: searchText,
            searchDateTime: searchDateTime,
            operator: operator,
            orderBy: orderBy,
            offSet: offSet,
          };
          const allNextChatConversations = await chatService.getTotalChatCoversationByRoomIdAndTime(
            params,
          );

          totalChatConversations = allNextChatConversations.length;
        }
      }
    }

    let pageNo = 1;
    let totalPages = 0;
    let data = [];
    if (parseInt(totalChatConversations) > 0) {
      pageNo = reqQuery.page ? parseInt(reqQuery.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatConversations / noOfRecordsPerPage);

      offSet = (pageNo - 1) * noOfRecordsPerPage;

      params.offSet = offSet;
      const chatConversations = await chatService.getUserChatHistoryByPagination(params);

      if (chatConversations) {
        for (const conversation of chatConversations) {
          //let username = await getUserNameByUserId(conversation.user_id);
          let info_message = "";
          if (conversation.content_type == "info") {
            /*info_message =
              conversation.message == "userHasArrived"
                ? "님이 입장했습니다."
                : "님이 퇴장하셨습니다.";*/
            info_message = req.__(conversation.message);
          }
          let unreadCount = await chatService.getCountAllUnreadMessages(conversation.id);
          let chatconversation = {
            local_conversation_id: conversation.id,
            conversation_recipient_id: conversation.conversation_recipient_id,
            conversation_id: conversation.id,
            timestamp: dayjs(conversation.create_date).valueOf(),
            content_type: conversation.content_type,
            message:
              conversation.content_type == "info"
                ? conversation.username + info_message
                : conversation.message,
            url_meta: conversation.url_meta,
            group_id: chatroomDetails.id,
            user_id: conversation.user_id,
            user_name: conversation.username,
            profile_image: conversation.profile_image,
            unread_count: unreadCount,
          };

          if (conversation.content_type != "text") {
            const conversationAttachments = await chatService.getConversationAttachments(
              conversation.id,
            );
            Object.assign(chatconversation, {
              ["attachments"]: JSON.stringify(conversationAttachments),
            });
          }

          let parentResponseData = {};
          if (conversation.parent_id) {
            const parentConversations = await chatService.getConversations(conversation.parent_id);

            parentResponseData = {
              local_conversation_id: parentConversations.id,
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

          if (conversation.is_reaction == "y") {
            const conversationReactions = await chatService.getConversationReactions(
              conversation.id,
            );
            Object.assign(chatconversation, {
              ["reactions"]: JSON.stringify(conversationReactions),
            });
          }
          let conversationEmoticons = {};
          if (conversation.content_type == "emoticon") {
            conversationEmoticons = await chatService.getEmoticonsItemsByID(
              conversation.emoticon_item_id,
            );
            Object.assign(chatconversation, {
              ["emoticons"]: JSON.stringify(conversationEmoticons),
            });
          } else {
            Object.assign(chatconversation, {
              ["emoticons"]: JSON.stringify(conversationEmoticons),
            });
          }

          Object.assign(chatconversation, { ["parentData"]: JSON.stringify(parentResponseData) });
          data.push(chatconversation);
        }
      }
    }

    if (totalPages <= pageNo && resultType != "next") {
      //let username = await getUserNameByUserId(chatroomDetails.user_id);
      let chatconversation = {
        conversation_recipient_id: 0,
        conversation_id: 0,
        timestamp: dayjs(chatroomDetails.create_date).valueOf(),
        content_type: "info",
        message: res.__("chatroomCreated"),
        group_id: chatroomDetails.id,
        user_id: chatroomDetails.user_id,
        user_name: chatroomDetails.username,
        profile_image: chatroomDetails.profile_image,
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
    console.log(error);
    next(error);
  }
};
