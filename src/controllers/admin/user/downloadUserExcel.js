import { adminService } from "../../../services/index.js";
import { StatusError } from "../../../config/index.js";
import excelJS from "exceljs";
/**
 * get tag list
 * @param req
 * @param res
 * @param next
 */
export const downloadUserExcel = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const searchName = reqBody.searchName ? reqBody.searchName : "";
    //const searchEmail = reqBody.searchEmail ? reqBody.searchEmail : "";
    const customer_id = reqBody.customer_id ? reqBody.customer_id : "";
    let searchParams = {
      searchName: searchName,
      customer_id: customer_id,
      //searchEmail: searchEmail,
      //userType: "user",
    };
    // get count of all user  and details
    const userDetails = await adminService.userService.getCountAllUser(
      reqBody.user_type,
      searchParams,
    );
    //if (userDetails.length === 0) throw StatusError.notFound("notFound");
    if (userDetails.length > 0) {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("List");
      worksheet.columns = [
        { header: res.__("SerialNo"), key: "s_no", width: 10 },
        { header: res.__("Nickname"), key: "name", width: 20 },
        { header: res.__("CustomerId"), key: "customer_id", width: 20 },
        { header: res.__("EmailID"), key: "email", width: 10 },
        { header: res.__("NoOfCreatedChatroom"), key: "chatroomCount", width: 10 },
        { header: res.__("NoofParticipants"), key: "chatroomParticipantCount", width: 10 },
      ];

      let counter = 1;
      userDetails.forEach((eachData) => {
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
        "attachment; filename=" + "user_list" + Date.now() + ".xlsx",
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
