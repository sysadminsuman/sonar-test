import { chatService, chatMembersService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import { convertDateToMillisecond, getCurrentTimeStamp } from "../../../helpers/index.js";
import dayjs from "dayjs";
/**
 * Get User All Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const getChatroomMedia = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const room_id = reqBody.room_id;
    let user_id = req.userDetails.userId;
    //console.log(user_id);
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    // get count of chat room
    const member = await chatMembersService.getChatroomMember(room_id, user_id);
    let joindate = dayjs(member.create_date).format("YYYY-MM-DD HH:mm:ss");
    let chatroomData = await chatService.getChatroomDetailsByID(reqBody.room_id, user_id);

    const allMedias = await chatService.getAllMediaCountDate(room_id, joindate);
    const totalMedias = allMedias.length;

    const currentTimeStamp = await getCurrentTimeStamp();

    let pageNo = 1;
    let totalPages = 0;
    let chatroomMedias = {};
    let medias = [];
    if (totalMedias > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalMedias / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      chatroomMedias = await chatService.getAllMediaDate(
        room_id,
        offSet,
        noOfRecordsPerPage,
        joindate,
      );
      for (const key in chatroomMedias) {
        let dateOnly = chatroomMedias[key].conversation_date;
        let datewiseMedia = await chatService.getAllMediaDatewise(room_id, dateOnly);
        for (const key in datewiseMedia) {
          if (datewiseMedia[key]["mstatus"] == "deleted") {
            datewiseMedia[key].sender_name = req.__("UnknownUser");
          }
        }
        //  console.log(datewiseMedia.length);
        if (datewiseMedia.length != 0) {
          medias[key] = chatroomMedias[key];
          medias[key].conversation_date = await convertDateToMillisecond(dateOnly);
          medias[key].conversations = datewiseMedia;
        }
      }
    }
    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalMedias,
      chatroom_medias: medias, //chatroomMedias,
      show_previous_chat_history: chatroomData.show_previous_chat_history,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
