import { adminService } from "../../../services/index.js";
//import { StatusError } from "../../../config/index.js";
import dayjs from "dayjs";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const newLoginGraph = async (req, res, next) => {
  try {
    let reqBody = req.query;
    var startDate = "";
    var endDate = "";

    startDate = reqBody.startDate;
    endDate = reqBody.endDate;
    if (!startDate && !endDate) {
      endDate = new Date();
      startDate = new Date(new Date().setDate(endDate.getDate() - 30));
    }
    var dateListCount = [];
    startDate = dayjs(startDate).format("YYYY-MM-DD");
    endDate = dayjs(endDate).format("YYYY-MM-DD");
    // return false;
    var dateMove = new Date(startDate);
    var strDate = startDate;
    while (strDate < endDate) {
      strDate = dateMove.toISOString().slice(0, 10);
      let loginCount = await adminService.userService.getNewLoginCountByDate(strDate);
      let day = {
        date: strDate,
        count: loginCount.login_count,
      };

      dateListCount.push(day);
      dateMove.setDate(dateMove.getDate() + 1);
    }
    return res.status(200).send({
      newLoginCounts: dateListCount,
    });
  } catch (error) {
    next(error);
  }
};
