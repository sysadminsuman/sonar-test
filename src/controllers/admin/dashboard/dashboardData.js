import { adminService } from "../../../services/index.js";
//import { StatusError } from "../../../config/index.js";
import dayjs from "dayjs";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const dashboardData = async (req, res, next) => {
  try {
    var today = new Date();
    var priorDate = new Date(new Date().setDate(today.getDate() - 30));
    let startDate = dayjs(today).format("YYYY-MM-DD HH:mm:ss");
    let endDate = dayjs(priorDate).format("YYYY-MM-DD HH:mm:ss");
    let chatroomCount = await adminService.dashboardService.getDashboardData(startDate, endDate);
    let regionCount = await adminService.regionService.getRegionCountData(startDate, endDate);
    return res.status(200).send({
      newChatRoomCount: chatroomCount,
      regionCount: regionCount,
    });
  } catch (error) {
    next(error);
  }
};
