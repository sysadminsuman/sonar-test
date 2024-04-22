import { insertOrUpdateDevice } from "./insertOrUpdateDevice.js";
import { deleteDevice, deleteDeviceOnly } from "./deleteDevice.js";
import { getDevicesForUsers, getDevicesByUserID } from "./getDevicesForUsers.js";
import { getAllDevices } from "./getAllDevices.js";
import { getDeviceDetails, getUserDeviceDetails } from "./getDeviceDetails.js";
import { updateDevice, updateAllDevice } from "./updateDevice.js";
import { insertDevice } from "./insertDevice.js";

export {
  insertOrUpdateDevice,
  deleteDevice,
  deleteDeviceOnly,
  getDevicesForUsers,
  getDevicesByUserID,
  getDeviceDetails,
  updateDevice,
  insertDevice,
  getAllDevices,
  updateAllDevice,
  getUserDeviceDetails,
};
