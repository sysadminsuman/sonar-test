import { regionService } from "../../../services/index.js";
//import { StatusError } from "../../config/index.js";
import {
  getCurrentTimeStamp,
  getCurrentDateTime,
  getLocationByGeocoder,
  getLocationByGeocoderFormatedAddress,
} from "../../../helpers/index.js";
/**
 * passcode verify
 * @param req
 * @param res
 * @param next
 */
export const checkChatroomLocation = async (req, res, next) => {
  try {
    const reqQuery = req.query;
    const lang = req.get("Accept-Language");
    const currentTimeStamp = await getCurrentTimeStamp();
    const userDetails = req.userDetails;
    let locationDetails = await getLocationByGeocoder(reqQuery.latitude, reqQuery.longitude);
    //console.log(locationDetails);
    //process.exit();

    let searchParams = {
      user_id: userDetails.userId,
      city: locationDetails.city,
      country: locationDetails.country,
      latitude: reqQuery.latitude,
      longitude: reqQuery.longitude,
    };

    const is_exist_city = await regionService.checkCityRegion(searchParams);
    if (is_exist_city.count > 0) {
      let locationDetailsIfmatchcity = await getLocationByGeocoderFormatedAddress(
        reqQuery.latitude,
        reqQuery.longitude,
      );
      res.status(200).send({
        status: true,
        city_id: is_exist_city.id,
        city: locationDetailsIfmatchcity.city,
        city_en: locationDetails.city,
        country: locationDetailsIfmatchcity.country,
        formated_address: locationDetailsIfmatchcity.formatedaddress,
        address: locationDetailsIfmatchcity.sublocality_level_1,
        nearest_cities: [],
        message: res.__("cityValidate"),
        current_timestamp: currentTimeStamp,
      });
    } else {
      let data = {
        city: locationDetails.city,
        country: locationDetails.country,
        latitude: reqQuery.latitude,
        longitude: reqQuery.longitude,
        created_by: userDetails.userId,
        create_date: await getCurrentDateTime(),
      };
      await regionService.addNotFoundCityRegion(data);
      const regionClosestData = await regionService.getClosestRegionData(searchParams);
      let locationDetailsIfmatchcity = await getLocationByGeocoderFormatedAddress(
        reqQuery.latitude,
        reqQuery.longitude,
      );
      res.status(200).send({
        status: false,
        city_id: is_exist_city.id,
        city: locationDetailsIfmatchcity.city,
        city_en: locationDetails.city,
        country: locationDetailsIfmatchcity.country,
        formated_address: locationDetailsIfmatchcity.formatedaddress,
        address: locationDetailsIfmatchcity.sublocality_level_1,
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
