import { chatService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import {
  getCurrentDateTime,
  getDateDifference,
  getDateDifferenceString,
} from "../../helpers/index.js";
/**
 * Search chatrooms
 * @param req
 * @param res
 * @param next
 */
export const searchChatroom = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userDetails = req.userDetails;
    // removing quatation in search key
    const searchKey = reqBody.search_key ? reqBody.search_key.replace(/["']/g, "") : "";
    const latitude = reqBody.latitude ? reqBody.latitude : "";
    const longitude = reqBody.longitude ? reqBody.longitude : "";
    const city = reqBody.city ? reqBody.city : "";
    const radius = reqBody.radius ? reqBody.radius : "";
    const search_type = reqBody.search_type ? reqBody.search_type : "";
    const order_by = (search_type=='noisy' ? 'noisy' : (search_type=='hot'?'hot':''));

    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

    let searchParams = {
      order_by: order_by,
      searchKey: searchKey,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      city: city,
    };

    // get chatroom count by search key
    const allChatrooms = await chatService.getCountChatroomSearch(searchParams);
    const totalChatrooms = allChatrooms.length;

    let pageNo = 1;
    let totalPages = 0;
    const listData = [];
    if (totalChatrooms > 0) {
      pageNo = reqBody.page ? reqBody.page : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatrooms / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      // search parameter
      const userChatrooms = await chatService.searchChatrooms(
        searchParams,
        userDetails.userId,
        offSet,
        noOfRecordsPerPage,
      );

      let currentDateTime = await getCurrentDateTime();
      //let timeDiff = await getDateDifference('2022-09-28 13:34:21', '2022-07-27 18:32:07');
      // console.log(timeDiff);
      let diffMsg = "";
      if (userChatrooms.length !== 0) {
        for (const key in userChatrooms) {
          if (userChatrooms[key].latest_message_time) {
            diffMsg = await getDateDifferenceString(
              currentDateTime,
              userChatrooms[key].latest_message_time,
            );
          }
          //console.log(diffMsg);
          let chatroom = {
            id: userChatrooms[key].id,
            room_name: userChatrooms[key].group_name,
            room_image_url: userChatrooms[key].group_image,
            already_joined: userChatrooms[key].owner === 0 ? false : true,
            latitude: userChatrooms[key].latitude,
            longitude: userChatrooms[key].longitude,
            country: userChatrooms[key].country,
            city: userChatrooms[key].city,
            room_users_count: userChatrooms[key].active_members,
            room_recent_time: diffMsg,
            distance: userChatrooms[key].distance
              ? parseFloat(userChatrooms[key].distance).toFixed(2)
              : "",
          };
          listData.push(chatroom);
        }
      }
    }

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatrooms,
      group_list: listData,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
