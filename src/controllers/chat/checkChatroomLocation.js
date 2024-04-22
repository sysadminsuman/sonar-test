import { regionService } from "../../services/index.js";
//import { StatusError } from "../../config/index.js";
import { getCurrentTimeStamp, getCurrentDateTime } from "../../helpers/index.js";
/**
 * passcode verify
 * @param req
 * @param res
 * @param next
 */
export const checkChatroomLocation = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    const currentTimeStamp = await getCurrentTimeStamp();
    const userDetails = req.userDetails;
    let searchParams = {
      user_id: userDetails.userId,
      city: reqQuery.city,
      country: reqQuery.country,
      latitude: reqQuery.latitude,
      longitude: reqQuery.longitude,
    };
    const is_exist_city = await regionService.checkCityRegion(searchParams);
    if (is_exist_city.count > 0) {
      res.status(200).send({
        status: true,
        city_id: is_exist_city.id,
        message: res.__("cityValidate"),
        current_timestamp: currentTimeStamp,
      });
    } else {
      let data = {
        city: reqQuery.city,
        country: reqQuery.country,
        latitude: reqQuery.latitude,
        longitude: reqQuery.longitude,
        created_by: userDetails.userId,
        create_date: await getCurrentDateTime(),
      };
      await regionService.addNotFoundCityRegion(data);
      const regionClosestData = await regionService.getClosestRegionData(searchParams);
      res.status(200).send({
        status: false,
        nearest_cities: regionClosestData,
        message_title: res.__("cityValidateTitle"),
        message: res.__("cityValidateSuccessfully"),
        current_timestamp: currentTimeStamp,
      });
    }
  } catch (error) {
    next(error);
  }
};
