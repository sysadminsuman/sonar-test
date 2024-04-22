import { chatService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";

/**
 * search messages
 * @param req
 * @param res
 * @param next
 */
export const messageSearch = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const roomId = reqBody.room_id;
    const searchKey = reqBody.search_key;

    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);

    // get count of chat messages
    const allMessage = await chatService.searchMessages(searchKey, roomId);
    const totalMessage = allMessage.length;

    let pageNo = 1;
    let totalPages = 0;
    if (totalMessage > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalMessage / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      var chatmessage = await chatService.searchMessageByPagination(
        roomId,
        searchKey,
        offSet,
        noOfRecordsPerPage,
      );
      res.status(200).send({
        pagination_limit: paginationLimit,
        total_pages: totalPages,
        current_page: pageNo,
        total_records: totalMessage,
        data: chatmessage,
      });
    } else {
      return res.status(201).send({
        pagination_limit: paginationLimit,
        total_pages: totalPages,
        current_page: pageNo,
        total_records: totalMessage,
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
