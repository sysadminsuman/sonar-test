import { adminService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const chatroomParticipantList = async (req, res, next) => {
  try {
    const reqParams = req.params;
    const reqBody = req.query;
    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

    const totalParticipantsData = await adminService.chatService.getChatroomparticipants(
      reqParams.room_id,
    );
    const totalParticipants = totalParticipantsData.length;

    let pageNo = 1;
    let totalPages = 0;
    if (totalParticipants > 0) {
      pageNo = reqBody.page ? reqBody.page : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalParticipants / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      var chatroomData = await adminService.chatService.getChatroomparticipantsByPagination(
        reqParams.room_id,
        offSet,
        noOfRecordsPerPage,
      );
    }
    return res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalParticipants,
      room_details: chatroomData,
    });
  } catch (error) {
    next(error);
  }
};
