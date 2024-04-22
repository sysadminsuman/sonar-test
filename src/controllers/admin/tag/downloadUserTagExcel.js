import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";
import dayjs from "dayjs";

/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadUserTagExcel = async (req, res, next) => {
  try {
    const reqBody = req.query;
    let create_date = "";
    let last_date = "";
    if (reqBody.startDate) {
      create_date = dayjs(reqBody.startDate).format("YYYY-MM-DD HH:mm:ss");
    }
    if (reqBody.endDate) {
      last_date = dayjs(reqBody.endDate).format("YYYY-MM-DD HH:mm:ss");
    }
    const tag_name = reqBody.name;
    const userId = reqBody.user_id;
    const startDate = create_date;
    const endDate = last_date;
    let searchParams = {
      name: tag_name,
      user_id: userId,
      startDate: startDate,
      endDate: endDate,
    };

    const tagListData = await adminService.tagService.getUserTag(searchParams);
    if (tagListData.length === 0) throw StatusError.notFound("noDataFound");
    const tagList = tagListData.length;

    if (tagList > 0) {
      //Get user taglist
      let tagListData = await adminService.tagService.getUserTagWithSearch(searchParams);

      let listData = [];
      for (const key in tagListData) {
        let dataDetails = {
          name: tagListData[key].name,
          chatroomCount: tagListData[key].chatroomCount,
          userCount: tagListData[key].userCount,
          create_date: tagListData[key].create_date,
          last_activity_date: tagListData[key].lastUseDate
            ? dayjs(tagListData[key].lastUseDate).format("YYYY-MM-DD HH:mm:ss")
            : "",
        };
        listData.push(dataDetails);
      }

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("TagName"), key: "name", width: 20 },
        { header: res.__("Noofchatrooms"), key: "chatroomCount", width: 10 },
        { header: res.__("Noofusers"), key: "userCount", width: 10 },
        { header: res.__("CreatedOn"), key: "create_date", width: 12 },
        { header: res.__("Recentuseddateandtime"), key: "last_activity_date", width: 20 },
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
        "attachment; filename=" + "user_tag" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    next(error);
  }
};
