import { adminService } from "../../../services/index.js";
//import { StatusError } from "../../../config/index.js";
import dayjs from "dayjs";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const newChatRoomGraph = async (req, res, next) => {
  try {
    let reqBody = req.query;
    var startDate = "";
    var endDate = "";
    var chatroomType = "";

    startDate = reqBody.startDate;
    endDate = reqBody.endDate;

    chatroomType = reqBody.chatroom_type;
    if (!startDate && !endDate) {
      endDate = new Date();
      startDate = new Date(new Date().setDate(endDate.getDate() - 30));
    }
    var dateListCount = [];
    startDate = dayjs(startDate).format("YYYY-MM-DD");
    endDate = dayjs(endDate).format("YYYY-MM-DD");
    // return false;
    // console.log(startDate);
    // console.log(endDate);
    var dateMove = new Date(startDate);
    var strDate = startDate;
    while (strDate < endDate) {
      //console.log(88);
      strDate = dateMove.toISOString().slice(0, 10);
      let loginCount = await adminService.chatService.getNewChatroomCountByDate(
        chatroomType,
        strDate,
      );
      let day = "";
      day = {
        date: strDate,
        general_count: loginCount.gereral_count,
        region_count: loginCount.region_count,
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
