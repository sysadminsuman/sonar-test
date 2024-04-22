import { chatService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const roomURL = async (req, res, next) => {
  try {
    const userDetails = req.userDetails;
    const userId = userDetails.userId;
    const currentTimeStamp = await getCurrentTimeStamp();
    let chatroomData = await chatService.getChatroomDetailsByURL(req.params.room_unique_id, userId);
    if (chatroomData.length === 0) throw StatusError.notFound("notFound");

    return res.status(200).send({
      room_details: chatroomData,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    next(error);
  }
};
