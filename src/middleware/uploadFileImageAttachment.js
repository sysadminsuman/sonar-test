import multer from "multer";
import multerS3 from "multer-s3";
import { getRandomNumbers } from "../helpers/index.js";
// import multerS3 from "multer-s3-transform";
// import sharp from "sharp";
import s3Storage from "multer-sharp-s3";
import { awsService } from "../services/index.js";
import { envs } from "../config/index.js";

const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;

const storageImage = s3Storage({
  s3: s3,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  Bucket: BUCKET_NAME + "/attachments/images",
  Key: function (req, file, cb) {
    // console.log("FILE: ", file);
    const fileName = file.originalname.split(".").shift();
    const timestamp = Date.now();
    const randomNumbers = getRandomNumbers(100000, 900000);
    const originalName = file.originalname;
    const extension = originalName.slice(originalName.lastIndexOf("."));
    const newFileName = `${fileName}-${randomNumbers}-${timestamp}${extension}`;
    cb(null, newFileName);
  },
  multiple: true,
  resize: [
    { suffix: "original" }, // insert BUCKET/large/filename
    { suffix: "medium", directory: "450_450", width: 450, height: 450 }, // insert BUCKET/medium/filename
    { suffix: "small", directory: "250_250", width: 250, height: 250 }, // insert BUCKET/small/filename
  ],
});

const fileFilter = (req, file, cb) => {
  //   uploadFilter(req, file, cb);
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, true);
    //return cb({ code: "LIMIT_FILE_TYPE" });
  }
};

export const uploadFileImageAttachment = multer({
  storage: storageImage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: fileFilter,
}).array("attachments", 10);
