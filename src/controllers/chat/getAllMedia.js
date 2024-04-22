import { chatService, chatMembersService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import dayjs from "dayjs";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * Get User All Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const getAllMedia = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const room_id = reqBody.room_id;
    let user_id = req.userDetails.userId;
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    // get count of chat room
    //const allMedias = await chatService.getCountAllMedia(room_id);
    const member = await chatMembersService.getChatroomMember(room_id, user_id);
    let joindate = dayjs(member.create_date).format("YYYY-MM-DD HH:mm:ss");
    const allMedias = await chatService.getAllMediaCount(room_id, joindate);
    const totalMedias = allMedias.length;
    const currentTimeStamp = await getCurrentTimeStamp();

    let pageNo = 1;
    let totalPages = 0;
    //let data = [];
    let chatroomMedias = {};
    if (totalMedias > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalMedias / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      /* const chatroomMedias = await chatService.getMediaByPagination(
        room_id,
        offSet,
        noOfRecordsPerPage,
      );
*/
      chatroomMedias = await chatService.getAllMedia(room_id, offSet, noOfRecordsPerPage, joindate);
      // data save in an array

      if (chatroomMedias) {
        for (const key in chatroomMedias) {
          if (chatroomMedias[key]["mstatus"] == "deleted") {
            chatroomMedias[key].sender_name = req.__("UnknownUser");
          }
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalMedias,
      chatroom_medias: chatroomMedias,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
