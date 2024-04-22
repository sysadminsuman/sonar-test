import { adminService } from "../../../services/index.js";
//import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";
import dayjs from "dayjs";

/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadPopularChatroomExcel = async (req, res, next) => {
  try {
    const reqBody = req.query;
    //const userDetails = req.userDetails;
    // include special character on search key
    // removing quatation in search key
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
    const group_type = reqBody.group_type ? reqBody.group_type : "";
    const status = reqBody.status ? reqBody.status : "";
    const user = reqBody.user ? reqBody.user : "";
    let create_date = "";
    let last_date = "";
    let lasta_start_date = "";
    let lasta_end_date = "";
    if (reqBody.create_start_date) {
      create_date = dayjs(reqBody.create_start_date).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.create_end_date) {
      last_date = dayjs(reqBody.create_end_date).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.last_start_date) {
      lasta_start_date = dayjs(reqBody.last_start_date).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.last_end_date) {
      lasta_end_date = dayjs(reqBody.last_end_date).format("YYYY-MM-DD HH:mm:ss");
    }

    let searchParams = {
      order_by: order_by,
      searchKey: searchKey,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      cities: cities,
      tag_id: tag_id,
      is_secret: is_secret,
      group_type: group_type,
      status: status,
      user: user,
      create_start_date: create_date,
      create_end_date: last_date,
      last_start_date: lasta_start_date,
      last_end_date: lasta_end_date,
    };

    const userChatrooms = await adminService.chatService.searchpopularChatrooms(searchParams);
    if (userChatrooms <= 0) throw StatusError.notFound("notFound");
    if (userChatrooms) {
      //Get user taglist
      let listData = [];
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      for (const key in userChatrooms) {
        let isProtected = userChatrooms[key].passcode ? "yes" : "no";
        let isRoomStatus = userChatrooms[key].status;
        let isStatus = "";
        if (isRoomStatus == "active") {
          isStatus = "활성";
        } else {
          isStatus = "비활성";
        }

        let isRoomType = userChatrooms[key].group_type;
        let isGroupType = "";
        if (isRoomType == "general") {
          isGroupType = "일반 채팅방";
        } else {
          isGroupType = "위치기반 채팅방";
        }
        let dataDetails = {
          id: userChatrooms[key].id,
          room_name: userChatrooms[key].group_name,
          group_type: isGroupType,
          no_of_participant: userChatrooms[key].active_members,
          address: userChatrooms[key].address,
          is_passcode_protected: isProtected,
          create_date: userChatrooms[key].create_date,
          status: isStatus,
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
        { header: res.__("ChatrromType"), key: "group_type", width: 10 },
        { header: res.__("Region"), key: "address", width: 10 },
        { header: res.__("NoofParticipants"), key: "no_of_participant", width: 10 },
        { header: res.__("Secret"), key: "is_passcode_protected", width: 10 },
        { header: res.__("CreatedOn"), key: "create_date", width: 12 },
        { header: res.__("LastactivityDate"), key: "last_activity_date", width: 12 },
        { header: res.__("Status"), key: "status", width: 10 },
      ];
      let worksheetData = listData.slice(listData, 10);

      let counter = 1;
      worksheetData.forEach((eachData) => {
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
        "attachment; filename=" + "Popular-Chatroom-Excel" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    next(error);
  }
};
