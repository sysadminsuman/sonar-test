import { userService } from "../services/index.js";

//Get username by user id
export const getUserNameByUserId = async (userId) => {
  const userDetails = await userService.getByUserId(userId);
  let userName = userDetails ? userDetails.name : "";
  return userName;
};
