import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";
/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadChatroomParticipantList = async (req, res, next) => {
  try {
    const reqBody = req.params;
    let chatRoomData = await adminService.chatService.getChatroomparticipants(reqBody.room_id);

    if (chatRoomData.length === 0) throw StatusError.notFound("notFound");

    if (chatRoomData) {
      let listData = [];
      for (const key in chatRoomData) {
        let isStatus = " ";
        let isRoomStatus = chatRoomData[key].memberStatus;
        if (isRoomStatus == "active") {
          isStatus = "활성";
        } else {
          isStatus = "비활성";
        }
        let dataDetails = {
          name: chatRoomData[key].name,
          email: chatRoomData[key].email,
          participated_date: chatRoomData[key].participated_date,
          memberStatus: isStatus,
        };
        listData.push(dataDetails);
      }

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("Participants"), key: "name", width: 20 },
        { header: res.__("Email"), key: "email", width: 10 },
        { header: res.__("ParticipatedDateandTime"), key: "participated_date", width: 10 },
        { header: res.__("Status"), key: "memberStatus", width: 10 },
      ];

      let counter = 1;
      listData.forEach((eachData) => {
        eachData.s_no = counter;
        worksheet.addRow(eachData); // Add data in worksheet
        counter++;
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "chatroom_participants" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    next(error);
  }
};
