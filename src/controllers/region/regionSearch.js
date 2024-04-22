import { regionService, settingService } from "../../services/index.js";
import { PAGINATION_LIMIT, SETTING_TYPES } from "../../utils/constants.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
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

    const allRegion = await regionService.getRegionData(searchKey);
    const totalRegion = allRegion.length;

    const currentTimeStamp = await getCurrentTimeStamp();

    let pageNo = 1;
    let totalPages = 0;
    if (totalRegion > 0) {
      pageNo = reqBody.page ? reqBody.page : pageNo;
      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalRegion / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      var userRegions = await regionService.regionSearchByPagination(
        searchKey,
        offSet,
        noOfRecordsPerPage,
      );
    }
    const setting = await settingService.getSettingByType(SETTING_TYPES.DEFAULT_LOCATION);
    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalRegion,
      search_key: searchKey,
      data: userRegions,
      default_latitude: setting.default_latitude,
      default_longitude: setting.default_longitude,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
