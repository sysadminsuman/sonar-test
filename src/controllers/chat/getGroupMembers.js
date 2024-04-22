import { chatMembersService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * Get All Group Members
 * @param req
 * @param res
 * @param next
 */
export const getGroupMembers = async (req, res, next) => {
  try {
    const roomId = req.params.room_id;
    const userDetails = req.userDetails;
    const groupMembersDetails = await chatMembersService.getGroupMembersList(
      roomId,
      userDetails.userId,
    );
    const notificationStatus = await chatMembersService.getnotificationStatus(
      roomId,
      userDetails.userId,
    );
    const currentTimeStamp = await getCurrentTimeStamp();
    // check member exist or not
    if (groupMembersDetails.length === 0) throw StatusError.badRequest("groupMemberNotExists");

    const groupMembersDetailsResult = groupMembersDetails.map((obj) => {
      return {
        user_id: obj.id,
        member_type: obj.member_type,
        user_name: obj.name,
        user_profile_image_url: obj.profile_image == null ? "" : obj.profile_image,
      };
    });

    res.status(200).send({
      members_list: groupMembersDetailsResult,
      is_enable_notification: notificationStatus,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
