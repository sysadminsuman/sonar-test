import { adminService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

import dayjs from "dayjs";

/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const getUserTagList = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);
    let create_date = "";
    let last_date = "";
    if (reqBody.startDate) {
      create_date = dayjs(reqBody.startDate).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.endDate) {
      last_date = dayjs(reqBody.endDate).format("YYYY-MM-DD HH:mm:ss");
    }
    const tag_name = reqBody.name;
    const user_name = reqBody.user_name;
    const startDate = create_date;
    const endDate = last_date;
    let searchParams = {
      name: tag_name,
      user_name: user_name,
      startDate: startDate,
      endDate: endDate,
    };
    let pageNo = 1;
    let totalPages = 0;
    const tagListData = await adminService.tagService.getUserTag(searchParams);
    //if (tagListData.length === 0) throw StatusError.notFound("noDataFound");
    const tagList = tagListData.length;
    if (tagList > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(tagList / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      //Get user taglist
      var tagListDataByPagination = await adminService.tagService.getUserTagByPagination(
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
    }
    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: tagListData.length,
      tagList: tagListDataByPagination,
    });
  } catch (error) {
    next(error);
  }
};
