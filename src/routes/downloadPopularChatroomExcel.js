import { adminService } from "../../../services/index.js";
//import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";

/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadPopularChatroomExcel = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const searchKey = reqBody.search_key
      ? reqBody.search_key
          .replace(/["']/g, "")
          .replace(/[.]/g, "\\.")
          .replace(/[,]/g, "\\,")
          .replace(/[%]/g, "\\%")
          .replace(/[_]/g, "\\_")
          .trim()
      : "";
    const latitude = reqBody.latitude ? reqBody.latitude : "";
    const longitude = reqBody.longitude ? reqBody.longitude : "";
    const cities = reqBody.cities ? reqBody.cities : "";
    const radius = reqBody.radius ? reqBody.radius : "";
    const search_type = reqBody.search_type ? reqBody.search_type : "";
    const order_by =
      search_type == "noisy"
        ? "noisy"
        : search_type == "hot"
        ? "hot"
        : search_type == "location"
        ? "location"
        : "";
    const tag_id = reqBody.tag_id ? reqBody.tag_id : "";
    const is_secret = reqBody.is_secret ? reqBody.is_secret : "";
    let searchParams = {
      order_by: order_by,
      searchKey: searchKey,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      cities: cities,
      tag_id: tag_id,
      is_secret: is_secret,
    };
    // get chatroom count by search key
    const allChatrooms = await adminService.chatService.getCountChatroomSearch(searchParams);
    const totalChatrooms = allChatrooms.length;

    if (totalChatrooms <= 0) throw StatusError.notFound("notFound");
    const userChatrooms = await adminService.chatService.searchChatrooms(searchParams);
    if (totalChatrooms > 0) {
      //Get user taglist
      let listData = [];
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      for (const key in userChatrooms) {
        let isProtected = userChatrooms[key].passcode ? "yes" : "no";
        let dataDetails = {
          id: userChatrooms[key].id,
          room_name: userChatrooms[key].group_name,
          no_of_participant: userChatrooms[key].active_members,
          address: userChatrooms[key].address,
          is_passcode_protected: isProtected,
          create_date: userChatrooms[key].create_date,
          status: userChatrooms[key].status,
          last_activity_date: userChatrooms[key].latest_message_time,
        };
        const chatroomUserDetails = await adminService.chatService.participantImages(
          userChatrooms[key].id,
        );
        for (const key2 in chatroomUserDetails) {
          let name = "";
          name = chatroomUserDetails[key2].name;
          dataDetails["name"] = name;
        }

        listData.push(dataDetails);
      }

      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("ChatroomName"), key: "room_name", width: 20 },
        { header: res.__("OwnerName"), key: "name", width: 10 },
        { header: res.__("Region"), key: "address", width: 10 },
        { header: res.__("NoofParticipants"), key: "no_of_participant", width: 10 },
        { header: res.__("Secret"), key: "is_passcode_protected", width: 10 },
        { header: res.__("CreatedOn"), key: "create_date", width: 12 },
        { header: res.__("LastactivityDate"), key: "last_activity_date", width: 12 },
        { header: res.__("Status"), key: "status", width: 10 },
      ];

      let counter = 1;
		  listData.forEach((eachData) => {
			if (counter <= 10){
				eachData.s_no = counter;
				worksheet.addRow(eachData); // Add data in worksheet
				counter++;
			}
			
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
        "attachment; filename=" + "all-chatrrom" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    next(error);
  }
};
