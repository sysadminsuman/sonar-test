import { chatService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import {
  getCurrentDateTime,
  getCurrentTimeStamp,
  getDateDifferenceString,
  convertDateToMillisecond,
} from "../../helpers/index.js";

import dayjs from "dayjs";
/**
 * Get User Latest Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const getUserLatestChatrooms = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    //const userDetails = req.userDetails;
    const currentTimeStamp = await getCurrentTimeStamp();
    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);
    // get count of chat room

    const allChatrooms = await chatService.getCountUserLatestChatrooms(reqQuery.user_id);
    const totalChatrooms = allChatrooms.length;

    let pageNo = 1;
    let totalPages = 0;
    let data = [];
    if (totalChatrooms > 0) {
      pageNo = reqQuery.page ? parseInt(reqQuery.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatrooms / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      const userChatrooms = await chatService.getUserLatestChatroomsByPagination(
        reqQuery.user_id,
        offSet,
        noOfRecordsPerPage,
      );
      // data save in an array
      if (userChatrooms) {
        let currentDateTime = await getCurrentDateTime();
        let diffMsg = "";
        let room_recent_timestamp = 0;
        let latest_message = "";
        for (const chat of userChatrooms) {
          if (chat.latest_message_time) {
            diffMsg = await getDateDifferenceString(currentDateTime, chat.latest_message_time);
            room_recent_timestamp = await convertDateToMillisecond(chat.latest_message_time);
          }
          latest_message =
            chat.latest_message == "image" ||
            chat.latest_message == "video" ||
            chat.latest_message == "emoticon"
              ? req.__(chat.latest_message)
              : chat.latest_message;
          let chatroom = {
            room_id: chat.id,
            room_unique_id: chat.room_unique_id,
            room_name: chat.group_name,
            room_image_url: chat.group_image,
            room_image_medium_url: chat.group_image_medium,
            room_image_small_url: chat.group_image_small,
            room_type: chat.group_type,
            unread_message_count: chat.total_unread,
            latest_message:
              chat.latest_message == "info" || !chat.latest_message ? "" : latest_message,
            room_recent_time: diffMsg,
            room_recent_timestamp: dayjs(room_recent_timestamp).valueOf(),
            room_users_count: chat.active_members,
            room_owner: chat.owner === 0 ? false : true,
            country: chat.country,
            city: chat.city,
          };
          data.push(chatroom);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatrooms,
      user_chatrooms: data,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }

  /*try {
    const reqQuery = req.query;

    //const userDetails = req.userDetails;

    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);

    const offSet = 0;

    /*const userChatrooms = await chatService.getUserLatestChatroomsByPagination(
      userDetails.userId,
      offSet,
      paginationLimit,
    );*/

  /*const userChatrooms = await chatService.getUserLatestChatroomsByPagination(
      offSet,
      paginationLimit,
    );
    let data = [];

    if (userChatrooms) {
      userChatrooms.forEach((chat) => {
        let chatroom = {
          room_id: chat.id,
          room_name: chat.group_name,
          unread_message_count: chat.total_unread,
        };
        data.push(chatroom);
      });
    }

    res.status(200).send({
      user_chatrooms: data,
    });
  } catch (error) {
    next(error);
  }*/
};
