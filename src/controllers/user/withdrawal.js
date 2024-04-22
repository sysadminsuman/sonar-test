//import bcrypt from "bcrypt";
import {
  userService,
  userDeviceService,
  chatMembersService,
  pushNotificationService,
  chatService,
} from "../../services/index.js";
import { NOTIFICATION_TYPES } from "../../utils/constants.js";
import { StatusError } from "../../config/index.js";
import { getCurrentDateTime, getCurrentUTCTime } from "../../helpers/index.js";
/**
 * User login by email and password
 * @param req
 * @param res
 * @param next
 */
export const withdrawal = async (req, res, next) => {
  try {
    const reqBody = req.body;
    let message = "";
    let success = false;
    const correntUTC = await getCurrentUTCTime();
    // get user details by login id
    const userDetails = await userService.getByCustomerID(reqBody.id);
    if (userDetails && userDetails.is_withdrawal == 1) {
      throw StatusError.badRequest("userNotExists");
    }
    if (!userDetails) {
      message = res.__("userNotExists");
    } else if (userDetails.is_withdrawal == 0) {
      const userRooms = await chatMembersService.getUserChatrooms(userDetails.id);
      for (const room of userRooms) {
        const is_owner = await chatMembersService.checkOwnerGroupMember(room.id, userDetails.id);
        const roomMemberList = await chatMembersService.getGroupMembersList(room.id);
        if (is_owner > 0) {
          let next_user_id = userDetails.id;
          if ((room.passcode == null || room.passcode == "") && roomMemberList.length > 0) {
            const nextMemberData = await chatMembersService.getNextGroupMember(room.id);
            if (nextMemberData) {
              next_user_id = nextMemberData.user_id;
              const updateNextMemberData = {
                member_type: "owner",
                updated_by: userDetails.id,
                update_date: correntUTC,
              };
              await chatMembersService.updateMember(updateNextMemberData, nextMemberData.id);
            }
          }

          const updateChatRoomData = {
            user_id: next_user_id,
            updated_by: userDetails.id,
            update_date: correntUTC,
          };
          await chatService.updateOpenGroup(updateChatRoomData, room.id);
        }

        if (roomMemberList.length == 0) {
          const updateObj = {
            status: "deleted",
          };
          await chatService.updateChatroom(updateObj, room.id);
        }
      }
      // data update in update user and group member list
      const upadate_data = {
        is_withdrawal: 1,
        status: "deleted",
      };
      await userService.updateUser(upadate_data, userDetails.id);

      const updateMemberData = {
        status: "deleted",
        updated_by: userDetails.id,
        update_date: await getCurrentDateTime(),
      };
      await chatMembersService.updateChatroomMember(updateMemberData, userDetails.id);

      message = res.__("userUpdateSuccessfull");
      success = true;
      /* push notification for withdrawal user */
      const notificationUserIds = [];
      const memberList = await userService.getAllJoinedMember(userDetails.id);
      let notificationType = NOTIFICATION_TYPES.WITHDRAWN;
      if (memberList.length > 0) {
        for (const member of memberList) {
          notificationUserIds.push(member.user_id);
        }
        let senderData = { sender: userDetails.id };
        pushNotificationService.sendWithdrawnNotification(
          notificationUserIds,
          notificationType,
          senderData,
          {
            room_name: "Withdrawn",
            user_id: userDetails.id,
            profile_image: userDetails.default_profile_image,
          },
        );
      } else {
        let senderData = { sender: userDetails.id };
        notificationUserIds.push(userDetails.id);
        pushNotificationService.sendWithdrawnNotification(
          notificationUserIds,
          notificationType,
          senderData,
          {
            room_name: "Withdrawn",
            user_id: userDetails.id,
            profile_image: userDetails.default_profile_image,
          },
        );
      }
      /* end */
      // remove user device

      // get user registered devices
      const devices = await userDeviceService.getDevicesForUsers(userDetails.id, notificationType);
      for (const device of devices) {
        await userDeviceService.deleteDevice(device.device_uuid, userDetails.userId);
      }
    }

    res.status(200).send({
      success: success,
      id: reqBody.id,
      message: message,
    });
  } catch (error) {
    next(error);
  }
};
