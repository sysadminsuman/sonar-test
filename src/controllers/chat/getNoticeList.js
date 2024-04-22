import { chatService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
import { StatusError } from "../../config/index.js";

import dayjs from "dayjs";
/**
 * Get User All Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const getNoticeList = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    //const userDetails = req.userDetails;
    const currentTimeStamp = await getCurrentTimeStamp();
    let chatroomData = await chatService.getChatroomDetails(reqQuery.room_id);
    if (!chatroomData) throw StatusError.notFound("notFound");
    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);
    // get count of notice
    const allChatroomNotices = await chatService.getNoticesByRoomID(reqQuery.room_id);
    const totalChatroomNotices = allChatroomNotices.length;

    let pageNo = 1;
    let totalPages = 0;
    let data = [];
    if (totalChatroomNotices > 0) {
      pageNo = reqQuery.page ? parseInt(reqQuery.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatroomNotices / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const chatroomNotices = await chatService.getNoticesByRoomID(
        reqQuery.room_id,
        offSet,
        noOfRecordsPerPage,
      );
      // data save in an array
      if (chatroomNotices) {
        for (const notice of chatroomNotices) {
          const notice_id = notice.id;
          const conversationData = await chatService.getConversations(notice.conversation_id);
          let noticeResponseData = {
            notice_id: notice_id,
            conversation_id: conversationData.id,
            timestamp: dayjs(notice.create_date).valueOf(),
            content_type: conversationData.content_type,
            message: conversationData.message,
            url_meta: conversationData.url_meta,
            user_id: conversationData.user_id,
            user_name: conversationData.name,
            profile_image: conversationData.profile_image,
            room_id: conversationData.room_id,
          };
          if (
            conversationData.content_type == "image" ||
            conversationData.content_type == "video"
          ) {
            const noticeConversationAttachments = await chatService.getConversationAttachments(
              conversationData.id,
            );
            Object.assign(noticeResponseData, {
              ["attachments"]: JSON.stringify(noticeConversationAttachments),
            });
          }
          data.push(noticeResponseData);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatroomNotices,
      chatroom_notices: data,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
