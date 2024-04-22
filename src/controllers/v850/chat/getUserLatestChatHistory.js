import {
  v850Service,
  chatService,
  chatMembersService,
  userService,
} from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";
import {
  //getCurrentDateTime,
  getCurrentTimeStamp,
} from "../../../helpers/index.js";
//import { envs } from "../../config/index.js";
/**
 * Get User Chat History
 * @param req
 * @param res
 * @param next
 */
export const getUserLatestChatHistory = async (req, res, next) => {
  try {
    const reqQuery = req.query;

    const userDetails = req.userDetails;

    const chatroomDetails = await chatService.getByRoomId(reqQuery.room_id);
    //console.log(userDetails);
    if (!chatroomDetails) throw StatusError.badRequest("invalidroomId");

    const member = await chatMembersService.getChatroomMember(reqQuery.room_id, userDetails.userId);
    if (!member) throw StatusError.badRequest("groupMemberNotExists");

    let show_notice = false;
    let noticeResponseData = {};
    let notice_id = 0;
    const noticeDetails = await chatService.getLatestNoticeByRoomID(reqQuery.room_id);
    if (noticeDetails) {
      show_notice = true;
      notice_id = noticeDetails.id;
      const conversationData = await chatService.getConversations(noticeDetails.conversation_id);

      const noticeUserData = await userService.getByUserId(noticeDetails.user_id);

      noticeResponseData = {
        notice_id: notice_id,
        conversation_id: conversationData.id,
        timestamp: dayjs(noticeDetails.create_date).valueOf(),
        content_type: conversationData.content_type,
        message: conversationData.message,
        url_meta: conversationData.url_meta,
        user_id: noticeDetails.user_id,
        user_name: noticeUserData.name,
        profile_image: noticeUserData.profile_image,
        room_id: conversationData.room_id,
        sender_name: conversationData.name,
        added_timestamp: dayjs(conversationData.create_date).valueOf(),
      };
      if (conversationData.content_type == "image" || conversationData.content_type == "video") {
        const noticeConversationAttachments = await chatService.getConversationAttachments(
          conversationData.id,
        );
        Object.assign(noticeResponseData, {
          ["attachments"]: JSON.stringify(noticeConversationAttachments),
        });
      }
    }

    const groupMembersDetails = await chatMembersService.getGroupMembersList(reqQuery.room_id);

    const unreadMsgCount = await chatService.getCountAllUnreadMessagesByUser(
      reqQuery.room_id,
      userDetails.userId,
    );

    const latest_unread_conversation_id = await chatService.getLastUnreadMessageID(
      reqQuery.room_id,
      userDetails.userId,
      "ASC",
    );

    const last_unread_conversation_id = await chatService.getLastUnreadMessageID(
      reqQuery.room_id,
      userDetails.userId,
      "DESC",
    );

    const latest_read_conversation_id = await chatService.getLastReadMessageID(
      reqQuery.room_id,
      userDetails.userId,
    );

    const totalLastReadConversations = await chatService.getCountLastReadMessage(
      reqQuery.room_id,
      userDetails.userId,
      last_unread_conversation_id,
    );

    const currentTimeStamp = await getCurrentTimeStamp();

    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);
    /*const searchDateTime = reqQuery.timestamp
      ? dayjs(reqQuery.timestamp).format("YYYY-MM-DD HH:mm:ss")
      : currentDateTime;*/
    const searchDateTime = reqQuery.timestamp
      ? dayjs(reqQuery.timestamp).format("YYYY-MM-DD HH:mm:ss")
      : "";
    let resultOrder = reqQuery.result_type ? reqQuery.result_type : "";
    let operator = resultOrder === "next" ? ">" : "<";
    let orderBy = "";
    let last_record = true;
    if (resultOrder === "next" && reqQuery.conversation_id == 0) {
      resultOrder = "first";
    }

    if (resultOrder === "first") {
      if (unreadMsgCount) {
        if (unreadMsgCount >= paginationLimit) {
          orderBy = "ASC";
          last_record = true;
        } else if (
          latest_unread_conversation_id > latest_read_conversation_id &&
          unreadMsgCount <= paginationLimit
        ) {
          orderBy = "DESC";
          last_record = false;
        } else if (
          latest_unread_conversation_id < latest_read_conversation_id &&
          unreadMsgCount <= paginationLimit
        ) {
          //console.log(totalLastReadConversations);
          if (totalLastReadConversations >= paginationLimit) {
            orderBy = "ASC";
            last_record = true;
          } else {
            orderBy = "DESC";
            last_record = false;
          }
        }
      } else {
        orderBy = "DESC";
        last_record = false;
      }
    } else if (resultOrder === "next") {
      orderBy = "ASC";
      last_record = true;
    } else if (resultOrder === "previous") {
      orderBy = "DESC";
      last_record = true;
    } else {
      orderBy = "DESC";
      last_record = false;
    }

    let offSet = 0;
    let joindate = dayjs(member.create_date).format("YYYY-MM-DD HH:mm:ss");
    let params = {
      roomId: reqQuery.room_id,
      userId: userDetails.userId,
      paginationLimit: paginationLimit,
      searchDateTime: searchDateTime,
      conversation_id: reqQuery.conversation_id,
      latest_unread_conversation_id: latest_unread_conversation_id,
      latest_read_conversation_id: latest_read_conversation_id,
      last_unread_conversation_id: last_unread_conversation_id,
      operator: operator,
      orderBy: orderBy,
      resultType: resultOrder,
      unreadMsgCount: unreadMsgCount,
      offSet: offSet,
      joindate: joindate,
      totalLastReadConversations: totalLastReadConversations,
      show_previous_chat_history: chatroomDetails.show_previous_chat_history,
    };
    //console.log(params);
    const allChatConversations =
      await v850Service.chatService.getTotalLatestChatCoversationByRoomIdAndTime(params);
    let totalChatConversations = allChatConversations.length;
    if (totalChatConversations < paginationLimit) {
      last_record = false;
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
      const chatConversations = await v850Service.chatService.getUserLatestChatHistoryByPagination(
        params,
      );

      if (chatConversations) {
        for (const conversation of chatConversations) {
          //let username = await getUserNameByUserId(conversation.user_id);
          let info_message = "";
          if (conversation.content_type == "info") {
            if (
              conversation.message == "passwordSet" ||
              conversation.message == "passwordChanged" ||
              conversation.message == "passwordRemove" ||
              conversation.message == "chatroomCreated" ||
              conversation.is_notice == "y"
            ) {
              info_message = req.__(conversation.message);
            } else {
              info_message =
                (conversation.mstatus == "active" && conversation.is_left == 0
                  ? conversation.username
                  : req.__("UnknownUser")) + req.__(conversation.message);
            }
          }
          let unreadCount = await chatService.getCountAllUnreadMessages(conversation.id);
          let chatconversation = {
            //conversation_recipient_id: conversation.conversation_recipient_id,
            conversation_id: conversation.id,
            timestamp: dayjs(conversation.create_date).valueOf(),
            content_type: conversation.content_type,
            message: conversation.content_type == "info" ? info_message : conversation.message,
            url_meta: conversation.url_meta,
            group_id: chatroomDetails.id,
            user_id: conversation.user_id,
            user_name:
              conversation.mstatus == "active" && conversation.is_left == 0
                ? conversation.username
                : req.__("UnknownUser"),
            profile_image:
              conversation.mstatus == "active" && conversation.is_left == 0
                ? conversation.profile_image
                : conversation.default_profile_image,
            unread_count: unreadCount,
            is_reported: conversation.is_reported === 0 ? false : true,
          };
          //console.log(conversation.mstatus);
          if (conversation.content_type == "image" || conversation.content_type == "video") {
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
              conversation_id: parentConversations.id,
              //conversation_recipient_id: parentConversations.id,
              timestamp: dayjs(parentConversations.create_date).valueOf(),
              content_type: parentConversations.content_type,
              message: parentConversations.message,
              user_id: parentConversations.user_id,
              user_name:
                parentConversations.mstatus == "active" ||
                parentConversations.message == "userKickOut" ||
                conversation.message == "userHasLeft" ||
                conversation.message == "userHasArrived"
                  ? parentConversations.name
                  : req.__("UnknownUser"),
              room_id: parentConversations.room_id,
              is_reported: parentConversations.is_reported === 0 ? false : true,
            };

            if (
              parentConversations.content_type == "image" ||
              parentConversations.content_type == "video"
            ) {
              const parentConversationAttachments = await chatService.getConversationAttachments(
                parentConversations.id,
              );
              Object.assign(parentResponseData, {
                ["attachments"]: JSON.stringify(parentConversationAttachments),
              });
            }

            let parentConversationEmoticons = {};
            if (
              parentConversations.content_type == "emoticon" &&
              parentConversations.emoticon_item_id
            ) {
              parentConversationEmoticons = await chatService.getEmoticonsItemsByID(
                parentConversations.emoticon_item_id,
              );
              Object.assign(parentResponseData, {
                ["emoticons"]: JSON.stringify(parentConversationEmoticons),
              });
            } else {
              Object.assign(parentResponseData, {
                ["emoticons"]: JSON.stringify(parentConversationEmoticons),
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
          if (conversation.content_type == "emoticon" && conversation.emoticon_item_id) {
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

    if (resultOrder === "first") {
      if (unreadMsgCount && unreadMsgCount >= paginationLimit) {
        data = data.reverse();
      }

      if (
        unreadMsgCount &&
        unreadMsgCount <= paginationLimit &&
        latest_unread_conversation_id < latest_read_conversation_id &&
        totalLastReadConversations >= paginationLimit
      ) {
        data = data.reverse();
      }
    }
    if (resultOrder === "next") {
      data = data.reverse();
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatConversations,
      last_record: last_record,
      unread_msg_count: unreadMsgCount,
      latest_unread_conversation_id: latest_unread_conversation_id,
      result_type: reqQuery.result_type ? reqQuery.result_type : "",
      current_timestamp: currentTimeStamp,
      group_id: chatroomDetails.id,
      room_unique_id: chatroomDetails.room_unique_id,
      group_name: chatroomDetails.group_name,
      group_create_timestamp: dayjs(chatroomDetails.create_date).valueOf(),
      group_member_count: groupMembersDetails.length,
      show_notice: show_notice,
      noticeData: noticeResponseData,
      message_list: data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
