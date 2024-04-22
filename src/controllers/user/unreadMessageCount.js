import { userService } from "../../services/index.js";

/**
 * Get user details
 * @param req
 * @param res
 * @param next
 */
export const unreadMessageCount = async (req, res, next) => {
  try {
    const userDetails = req.userDetails;

    const customerDetails = await userService.getByCustomerID(userDetails.customer_id);
    let total_unread_message_count = "";
    if (customerDetails) {
      if (customerDetails.is_overall_notification == "y") {
        const unread_count = await userService.getUnreadMessageCount(customerDetails.id);
        if (unread_count >= 100) {
          total_unread_message_count = "+99";
        } else if (unread_count > 0) {
          total_unread_message_count = unread_count.toString();
        }
      }
    }

    res.status(200).send({
      success: true,
      total_unread_message_count: total_unread_message_count,
    });
  } catch (error) {
    next(error);
  }
};
