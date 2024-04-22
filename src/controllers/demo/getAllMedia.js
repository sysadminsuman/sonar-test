import { chatService } from "../../services/index.js";

import { PAGINATION_LIMIT } from "../../utils/constants.js";
import { getCurrentTimeStamp, getRandomNumbers } from "../../helpers/index.js";
import { ROOMLIST } from "../../utils/loadTesting.js";

/**
 * User Join Open Chatroom
 * @param req
 * @param res
 * @param next
 */

export const getAllMedia = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const rndInt = getRandomNumbers(1, 10);
    const room_id = ROOMLIST[rndInt];
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    // get count of chat room
    //const allMedias = await chatService.getCountAllMedia(room_id);

    const allMedias = await chatService.getAllMediaCount(room_id);
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

      chatroomMedias = await chatService.getAllMedia(room_id, offSet, noOfRecordsPerPage);
      // data save in an array
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
    console.log(error);
    next(error);
  }
};
