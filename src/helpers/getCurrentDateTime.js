import dayjs from "dayjs";

// get current date in format
export const getCurrentDateTime = async () => {
  const dateString = dayjs().format("YYYY-MM-DD HH:mm:ss");
  return dateString;
};
