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
export const downloadAdminTagExcel = async (req, res, next) => {
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
    const startDate = create_date;
    const endDate = last_date;
    const status = reqBody.status;
    let searchParams = {
      name: tag_name,
      startDate: startDate,
      endDate: endDate,
      status: status,
    };
    const tagListData = await adminService.tagService.getAdminTagWithSearch(searchParams);
    if (tagListData.length === 0) throw StatusError.notFound("notFound");

    const tagList = tagListData.length;

    if (tagList > 0) {
      //Get user taglist
      let tagListData = await adminService.tagService.getAdminTagWithSearch(searchParams);
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("TagName"), key: "name", width: 20 },
        { header: res.__("Noofchatrooms"), key: "chatroomCount", width: 10 },
        { header: res.__("Noofusers"), key: "userCount", width: 10 },
        { header: res.__("CreatedOn"), key: "create_date", width: 12 },
        { header: res.__("Recentuseddateandtime"), key: "lastUseDate", width: 12 },
        { header: res.__("Exposure"), key: "status", width: 10 },
      ];

      let counter = 1;
      tagListData.forEach((eachData) => {
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
        "attachment; filename=" + "admin_tag" + Date.now() + ".xlsx",
      );
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
  } catch (error) {
    next(error);
  }
};
