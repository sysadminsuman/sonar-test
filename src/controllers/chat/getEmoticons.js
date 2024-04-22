import { chatService } from "../../services/index.js";
import { getCurrentTimeStamp } from "../../helpers/index.js";
/**
 * Get User All Chatrooms
 * @param req
 * @param res
 * @param next
 */
export const getEmoticons = async (req, res, next) => {
  try {
    let chatroomEmoticons = {};
    chatroomEmoticons = await chatService.getEmoticonsDetails();
    const currentTimeStamp = await getCurrentTimeStamp();
    res.status(200).send({
      chatroom_medias: chatroomEmoticons,
      current_timestamp: currentTimeStamp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
