import { chatService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * passcode verify
 * @param req
 * @param res
 * @param next
 */
export const passcodeVerify = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const currentTimeStamp = await getCurrentTimeStamp();
    let chatroomData = await chatService.getChatroomDetails(reqBody.room_id);
    //if (!chatroomData) throw StatusError.notFound("notFound");

    if (!chatroomData) throw StatusError.notFound("roomNotFound");

    const chatroomPasscode = await chatService.getChatroomPasscode(reqBody.room_id);

    let givenPasscode = Buffer.from(reqBody.passcode).toString("base64");
    if (givenPasscode != chatroomPasscode) {
      res.status(200).send({
        message: res.__("WrongPasscode"),
        status: false,
        user_id: userId,
        room_id: chatroomData.id,
      });
    } else {
      res.status(200).send({
        status: true,
        user_id: userId,
        room_id: chatroomData.id,
        room_unique_id: chatroomData.room_unique_id,
        room_name: chatroomData.group_name,
        room_image_url: chatroomData.group_image,
        room_image_medium_url: chatroomData.group_image_medium,
        room_image_small_url: chatroomData.group_image_small,
        room_type: chatroomData.group_type,
        country: chatroomData.country,
        city: chatroomData.city,
        address: chatroomData.address,
        url: chatroomData.url,
        current_timestamp: currentTimeStamp,
      });
    }
    // compare password
    /*
    let isSame = await bcrypt.compare(reqBody.passcode, chatroomPasscode);
    if (!isSame) throw StatusError.badRequest("WrongPasscode");
    */
  } catch (error) {
    next(error);
  }
};
