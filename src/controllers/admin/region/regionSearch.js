import { adminService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";

/**
 * region search
 * @param req
 * @param res
 * @param next
 */
export const regionData = async (req, res, next) => {
  try {
    const reqBody = req.query;
    let searchKey = "";
    if (reqBody.search_key && reqBody.search_key != "") {
      searchKey = reqBody.search_key.replace(/["']/g, "");
    }

    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

    const allRegion = await adminService.regionService.getRegionData(searchKey);
    const totalRegion = allRegion.length;

    let pageNo = 1;
    let totalPages = 0;
    if (totalRegion > 0) {
      pageNo = reqBody.page ? reqBody.page : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalRegion / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      var userRegions = await adminService.regionService.regionSearchByPagination(
        searchKey,
        offSet,
        noOfRecordsPerPage,
      );
    }
    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalRegion,
      data: userRegions,
      //data: allRegion,
    });
  } catch (error) {
    next(error);
  }
};
