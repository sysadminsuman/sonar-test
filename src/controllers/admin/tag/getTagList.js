import { adminService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import dayjs from "dayjs";
/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const getTagList = async (req, res, next) => {
  try {
    const reqBody = req.query;
    let create_date = "";
    let last_date = "";
    if (reqBody.startDate) {
      create_date = dayjs(reqBody.startDate).format("YYYY-MM-DD");
    }
    if (reqBody.endDate) {
      last_date = dayjs(reqBody.endDate).format("YYYY-MM-DD");
    }
    const tag_name = reqBody.name;
    const startDate = create_date;
    const endDate = last_date;
    const status = reqBody.status;
    const startRange = reqBody.startRange ? reqBody.startRange : "";
    const endRange = reqBody.endRange ? reqBody.endRange : "";

    let searchParams = {
      name: tag_name,
      startDate: startDate,
      endDate: endDate,
      status: status,
      startRange: startRange,
      endRange: endRange,
    };
    //console.log(searchParams);
    const paginationLimit = reqBody.record_count
      ? parseInt(reqBody.record_count)
      : parseInt(PAGINATION_LIMIT);

    const tagListData = await adminService.tagService.getAdminTagWithSearch(searchParams);
    const tagList = tagListData.length;

    let pageNo = 1;
    let totalPages = 0;

    if (tagList > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(tagList / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      var tagListDataByPagination = await adminService.tagService.getTagByPagination(
        offSet,
        noOfRecordsPerPage,
        searchParams,
      );
    }
    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: tagList,
      tagList: tagListDataByPagination,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
