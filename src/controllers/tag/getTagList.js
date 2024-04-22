import { tagService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const getTaglist = async (req, res, next) => {
  try {
    const reqQuery = req.query;

    const paginationLimit = reqQuery.record_count
      ? parseInt(reqQuery.record_count)
      : parseInt(PAGINATION_LIMIT);

    const tagListData = await tagService.getTag();
    const tagList = tagListData.length;
    const currentTimeStamp = await getCurrentTimeStamp();

    let pageNo = 1;
    let totalPages = 0;

    let filter = {};
    if (reqQuery.order_key) {
      filter.order_key = reqQuery.order_key;
    }
    if (reqQuery.order_key) {
      filter.withrooms = reqQuery.withrooms;
    }
    if (tagList > 0) {
      pageNo = reqQuery.page ? parseInt(reqQuery.page) : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(tagList / noOfRecordsPerPage);
      const offSet = (pageNo - 1) * noOfRecordsPerPage;

      var tagListDataByPagination = await tagService.getTagByPagination(
        offSet,
        noOfRecordsPerPage,
        filter,
      );
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: tagList,
      tagList: tagListDataByPagination,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
