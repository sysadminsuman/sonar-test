import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import tz from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(tz);

// get current utc time
export const getCurrentUTCTime = async () => {
  const dateString = dayjs.utc().format("YYYY-MM-DD HH:mm:ss");
  return dateString;
};

// get current local time using timezone
export const getLocalTimeByTimezone = async (dateString) => {
  //const timeZone = dayjs.tz.guess();
  const dateLocalString = dayjs.utc(dateString).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
  return dateLocalString;
};
