import { userDeviceService } from "../../services/index.js";

/**
 * Remove user device
 * @param req
 * @param res
 * @param next
 */
export const deleteUserDevice = async (req, res, next) => {
  try {
    const deviceUuid = req.params.uuid;
    //const userDetails = req.userDetails;
    // remove user device
    await userDeviceService.deleteDevice(deviceUuid);
    // remove device
    //await userDeviceService.deleteDeviceOnly(deviceUuid);
    res.status(200).send({ success: true });
  } catch (error) {
    next(error);
  }
};
