import { chatService, userService } from "../../services/index.js";
import { PAGINATION_LIMIT } from "../../utils/constants.js";
import dayjs from "dayjs";
import { getCurrentDateTime, getCurrentTimeStamp } from "../../helpers/index.js";
//import { getCurrentDateTime, getDateDifferenceString } from "../../helpers/index.js";
/**
 * Search Not Participating Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const searchNotParticipatingChatrooms = async (req, res, next) => {
  try {
    const reqBody = req.query;
    const userDetails = req.userDetails;
    const currentTimeStamp = await getCurrentTimeStamp();
    // include special character on search key
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
    const is_secret = reqBody.is_secret ? reqBody.is_secret : "";
    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

    const city = reqBody.city ? reqBody.city.trim() : "";

    let searchParams = {
      order_by: order_by,
      searchKey: searchKey,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      cities: cities,
      tag_id: tag_id,
      is_secret: is_secret,
      durationmonth: durationmonth,
      durationday: durationday,
      city: "",
    };
    // get chatroom count by search key
    const allChatrooms = await chatService.getCountUserNotParticipatingChatrooms(
      userDetails.userId,
      searchParams,
    );
    let totalChatrooms = allChatrooms.length;

    if (search_type == "location" && totalChatrooms == 0) {
      searchParams.city = city;
      totalChatrooms = await chatService.getCountUserNotParticipatingChatroomsoptimised(
        userDetails.userId,
        searchParams,
      );
    }

    let pageNo = "1";
    let totalPages = 0;
    const listData = [];
    if (totalChatrooms > 0) {
      pageNo = reqBody.page ? reqBody.page : pageNo;

      const noOfRecordsPerPage = parseInt(paginationLimit);
      totalPages = Math.ceil(totalChatrooms / noOfRecordsPerPage);

      const offSet = (parseInt(pageNo) - 1) * noOfRecordsPerPage;

      const userChatrooms = await chatService.getUserNotParticipatingChatroomsByPagination(
        searchParams,
        userDetails.userId,
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
            area_radius: userChatrooms[key].area_radius,
            is_passcode_protected: userChatrooms[key].is_passcode_protected,
            url: userChatrooms[key].url,
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
    /* data user's location update */
    const userData = {
      latitude: latitude,
      longitude: longitude,
      update_date: await getCurrentDateTime(),
    };
    await userService.updateUser(userData, userDetails.userId);
    /* end user's location update */

    res.status(200).send({
      pagination_limit: paginationLimit,
      total_pages: totalPages,
      current_page: pageNo,
      total_records: totalChatrooms,
      group_list: listData,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
