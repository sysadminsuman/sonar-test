import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const getTagChatroomList = async (req, res, next) => {
  try {
    const reqBody = req.params;
    const paginationLimit = req.query.record_count
      ? parseInt(req.query.record_count)
      : parseInt(PAGINATION_LIMIT);

    let pageNo = 1;
    let totalPages = 0;
    let tagData = await adminService.tagService.getTagChatroomList(reqBody.id);
    //if (tagData.length === 0) throw StatusError.notFound("recordnotFound");
    let tagList = tagData.length;
    if (tagList > 0) {
      pageNo = req.query.page ? parseInt(req.query.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(tagList / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      //Get user taglist
      var tagListDataByPagination = await adminService.tagService.getTagChatroomListPagination(
        reqBody.id,
        offSet,
        noOfRecordsPerPage,
      );
    }

    //if (tagData.length === 0) throw StatusError.notFound("notFound");

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: tagList,
      tagList: tagListDataByPagination,
    });
  } catch (error) {
    next(error);
  }
};
