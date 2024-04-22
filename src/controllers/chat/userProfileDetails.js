import { chatMembersService, userService } from "../../services/index.js";
import { envs } from "../../config/index.js";
//import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";

/**
 * passcode verify
 * @param req
 * @param res
 * @param next
 */
export const userProfileDetails = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const currentTimeStamp = await getCurrentTimeStamp();
    //let chatroomData = await chatService.getChatroomDetails(reqQuery.room_id);
    //if (chatroomData.length === 0) throw StatusError.notFound("notFound");

    const memberDetails = await userService.getByUserId(reqQuery.chat_member_id);

    const isExists = await chatMembersService.getChatroomMember(reqQuery.room_id, userId);

    res.status(200).send({
      chat_member_id: memberDetails.id,
      chat_member_name: memberDetails.name,
      chat_member_email: memberDetails.email,
      chat_member_mobile: memberDetails.mobile,
      chat_member_profile_image_url: envs.aws.cdnpath + memberDetails.profile_image,
      login_user_is_owner:
        isExists && isExists.member_type == "owner" && isExists.status == "active" ? true : false,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
