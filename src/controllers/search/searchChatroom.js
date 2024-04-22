import { chatService, settingService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
import dayjs from "dayjs";
import { SETTING_TYPES } from "../../utils/constants.js";
/**
 * Search chatrooms
 * @param req
 * @param res
 * @param next
 */
export const searchChatroom = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const currentTimeStamp = await getCurrentTimeStamp();

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
    const cities = reqBody.cities ? reqBody.cities.split(",") : "";
    const radius = reqBody.radius ? reqBody.radius : "";
    const search_type = reqBody.search_type ? reqBody.search_type : "";
    const durationmonth = reqBody.durationmonth ? reqBody.durationmonth : 0;
    const durationday = reqBody.durationday ? reqBody.durationday : 0;
    const order_by =
      search_type == "noisy"
        ? "noisy"
        : search_type == "hot"
        ? "hot"
        : search_type == "location"
        ? "location"
        : "";
    const tag_id = reqBody.tag_id ? reqBody.tag_id : "";
    const exclude_secret = reqBody.is_secret ? reqBody.is_secret : 0;

    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

    let searchParams = {
      order_by: order_by,
      searchKey: searchKey,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      cities: cities,
      tag_id: tag_id,
      is_secret: exclude_secret,
      durationmonth: durationmonth,
      durationday: durationday,
    };

    // get chatroom count by search key
    const allChatrooms = await chatService.getCountChatroomSearch(searchParams);
    const totalChatrooms = allChatrooms.length;

    let pageNo = "1";
    let totalPages = 0;
    const listData = [];
    if (totalChatrooms > 0) {
      pageNo = parseInt(reqBody.page) ? reqBody.page : pageNo;

      const noOfRecordsPerPage = parseInt(paginationLimit);
      totalPages = Math.ceil(totalChatrooms / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      // search parameter
      const userChatrooms = await chatService.searchChatrooms(
        searchParams,
        //userDetails.userId,
        offSet,
        noOfRecordsPerPage,
      );

      //let currentDateTime = await getCurrentDateTime();
      //let diffMsg = "";
      if (userChatrooms.length !== 0) {
        for (const key in userChatrooms) {
          /*if (userChatrooms[key].latest_message_time) {
            diffMsg = await getDateDifferenceString(
              currentDateTime,
              userChatrooms[key].latest_message_time,
            );
          }*/
          const distance =
            Math.round(userChatrooms[key].distance) >= 1
              ? Math.round(userChatrooms[key].distance) + "km"
              : parseInt(userChatrooms[key].distance * 1000) + "m";

          let chatroom = {
            id: userChatrooms[key].id,
            room_unique_id: userChatrooms[key].room_unique_id,
            room_name: userChatrooms[key].group_name,
            room_image_url: userChatrooms[key].group_image,
            room_image_medium_url: userChatrooms[key].group_image_medium,
            room_image_small_url: userChatrooms[key].group_image_small,
            room_type: userChatrooms[key].group_type,
            already_joined: userChatrooms[key].owner === 0 ? false : true,
            latitude: userChatrooms[key].latitude,
            longitude: userChatrooms[key].longitude,
            country: userChatrooms[key].country,
            city: userChatrooms[key].city,
            address: userChatrooms[key].address,
            room_users_count: userChatrooms[key].active_members,
            room_recent_time: dayjs(userChatrooms[key].latest_message_time).valueOf(),
            distance: distance,
            is_passcode_protected: userChatrooms[key].is_passcode_protected,
          };
          //if (order_by == "hot") {
          chatroom["user_profile_image"] = await chatService.participantImages(
            userChatrooms[key].id,
          );
          //}
          listData.push(chatroom);
        }
      }
    }

    //const setting = await settingService.getSettingByType(SETTING_TYPES.SEARCH_BAR_TXT);

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatrooms,
      group_list: listData,
      //search_bar_text: setting.text,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
