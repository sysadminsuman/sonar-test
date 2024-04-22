import { adminService, chatMembersService } from "../../../services/index.js";
import { PAGINATION_LIMIT } from "../../../utils/constants.js";
import { getCurrentDateTime, getDateDifferenceString } from "../../../helpers/index.js";
import dayjs from "dayjs";
/**
 * Search chatrooms
 * @param req
 * @param res
 * @param next
 */
export const searchChatroom = async (req, res, next) => {
  try {
    const reqBody = req.query;
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
    const paginationLimit = reqBody.record_count ? reqBody.record_count : PAGINATION_LIMIT;

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

    const allChatrooms = await adminService.chatService.getCountChatroomSearch(searchParams);
    const totalChatrooms = allChatrooms.length;

    let pageNo = 1;
    let totalPages = 0;
    const listData = [];
    if (totalChatrooms > 0) {
      pageNo = reqBody.page ? parseInt(reqBody.page) : pageNo;

      const noOfRecordsPerPage = paginationLimit;
      totalPages = Math.ceil(totalChatrooms / noOfRecordsPerPage);

      const offSet = (pageNo - 1) * noOfRecordsPerPage;
      // search parameter
      const userChatrooms = await adminService.chatService.searchChatrooms(
        searchParams,
        //userDetails.userId,
        offSet,
        noOfRecordsPerPage,
      );
      let currentDateTime = await getCurrentDateTime();
      let diffMsg = "";
      if (userChatrooms.length !== 0) {
        for (const key in userChatrooms) {
          if (userChatrooms[key].latest_message_time) {
            diffMsg = await getDateDifferenceString(
              currentDateTime,
              userChatrooms[key].latest_message_time,
            );
          }
          let chatroom_status = "";
          if (userChatrooms[key].passcode != "" && userChatrooms[key].passcode != null) {
            const checkOwner = await chatMembersService.getChatroomMember(
              userChatrooms[key].id,
              userChatrooms[key].owner_user_id,
            );
            if (checkOwner) {
              chatroom_status = "active";
            } else {
              chatroom_status = "deleted";
            }
          }

          let chatroom = {
            id: userChatrooms[key].id,
            room_unique_id: userChatrooms[key].room_unique_id,
            room_passcode: userChatrooms[key].passcode,
            room_name: userChatrooms[key].group_name,
            room_image_url: userChatrooms[key].group_image,
            room_image_medium_url: userChatrooms[key].group_image_medium,
            room_image_small_url: userChatrooms[key].group_image_small,
            room_type: userChatrooms[key].group_type,
            already_joined: userChatrooms[key].owner === 0 ? false : true,
            day7convertations: userChatrooms[key].day7convertations,
            latitude: userChatrooms[key].latitude,
            longitude: userChatrooms[key].longitude,
            country: userChatrooms[key].country,
            city: userChatrooms[key].city,
            address: userChatrooms[key].address,
            room_users_count: userChatrooms[key].active_members,
            room_recent_time: diffMsg,
            distance: userChatrooms[key].distance
              ? parseFloat(userChatrooms[key].distance).toFixed(2)
              : "",
            area_radius: userChatrooms[key].area_radius,
            is_passcode_protected: userChatrooms[key].is_passcode_protected,
            url: userChatrooms[key].url,
            owner: userChatrooms[key].owner,
            owner_user_id: userChatrooms[key].owner_user_id,
            created_date: userChatrooms[key].create_date,
            last_activity_date: userChatrooms[key].latest_message_time,
            status: chatroom_status ? chatroom_status : userChatrooms[key].status,
          };
          //if (order_by == "hot") {
          chatroom["user_profile_image"] = await adminService.chatService.participantImages(
            userChatrooms[key].id,
          );
          //}
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
    next(error);
  }
};
