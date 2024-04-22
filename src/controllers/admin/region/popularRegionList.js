import { adminService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
//import { StatusError } from "../../../config/index.js";
import dayjs from "dayjs";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const popularRegionList = async (req, res, next) => {
  try {
    const userRegions = await adminService.regionService.getPopularRegionData(); 
    return res.status(200).send({
      data: userRegions,
    });
  } catch (error) {
    next(error);
  }
};
