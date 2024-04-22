import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";
/**
 * User edit
 * @param req
 * @param res
 * @param next
 */
export const getcreatedChatroomsOfUser = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    const getId = req.params.id;
    let create_date = "";
    let last_date = "";
    if (reqBody.startDate) {
      create_date = dayjs(reqBody.startDate).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.endDate) {
      last_date = dayjs(reqBody.endDate).format("YYYY-MM-DD HH:mm:ss");
    }
    const name = reqBody.search_name;
    const memberType = reqBody.member_type;
    const chatroomType = reqBody.chatroom_type;
    const privacyType = reqBody.privacy_type;
    const startDate = create_date;
    const endDate = last_date;

    let searchParams = {
      name: name,
      memberType: memberType,
      chatroomType: chatroomType,
      privacyType: privacyType,
      startDate: startDate,
      endDate: endDate,
    };
    let chatroomData = await adminService.chatService.getCreatedChatrooms(getId, searchParams);
    //if (chatroomData.length === 0) throw StatusError.notFound("recordnotFound");

    let pageNo = 1;
    let totalPages = 0;
    if (chatroomData.length > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      //Get user chatroom list
      var chatroomDataByPagination = await adminService.chatService.getUserChatroomsByPagination(
        getId,
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
      totalPages = Math.ceil(chatroomData.length / noOfRecordsPerPage);
    }

    return res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: chatroomData.length,
      room_details: chatroomDataByPagination,
    });
  } catch (error) {
    
    next(error);
  }
};
