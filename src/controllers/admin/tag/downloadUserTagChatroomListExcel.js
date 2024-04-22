import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";
/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadUserTagChatroomListExcel = async (req, res, next) => {
  try {
    const reqBody = req.params;
    let chatRoomData = await adminService.tagService.getTagChatroomList(reqBody.id);
    if (chatRoomData.length === 0) throw StatusError.notFound("notFound");
    if (chatRoomData) {
      let listData = [];
      for (const key in chatRoomData){
        let isProtected = chatRoomData[key].passcode ? "yes" : "no";
        let isRoomStatus = chatRoomData[key].status ;
        let isStatus=" ";
             
        if(isRoomStatus=="active"){
          isStatus = "활성";
        }
        else{
          isStatus ="비활성";
        }
        let isRoomType =  chatRoomData[key].group_type;
        let isGroupType="";
        if(isRoomType=="general"){
          isGroupType = "일반 채팅방";
        }
        else{
          isGroupType ="위치기반 채팅방";
        }
        let dataDetails = {
          id: chatRoomData[key].id,
          room_name: chatRoomData[key].group_name,
          owner_name: chatRoomData[key].name,
          group_type: isGroupType,
          address: chatRoomData[key].address,
          no_of_participant: chatRoomData[key].participantsCount,
          is_passcode_protected: isProtected,
          create_date: chatRoomData[key].create_date,
          status: isStatus,
          last_activity_date: chatRoomData[key].latest_message_time,
        };
        listData.push(dataDetails);


      }
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("ChatroomName"), key: "room_name", width: 20 },
        { header: res.__("OwnerName"), key: "owner_name", width: 10 },
        { header: res.__("ChatrromType"), key: "group_type", width: 10 },
        { header: res.__("Region"), key: "address", width: 10 },
        { header: res.__("NoofParticipants"), key: "no_of_participant", width: 10 },
        { header: res.__("Secret"), key: "is_passcode_protected", width: 10 },
        { header: res.__("CreatedOn"), key: "create_date", width: 12 },
        { header: res.__("LastactivityDate"), key: "last_activity_date", width: 12 },
        { header: res.__("Status"), key: "status", width: 10 },
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
        "attachment; filename=" + "user_tag_chatroom" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
