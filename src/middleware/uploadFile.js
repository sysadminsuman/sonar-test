import multer from "multer";
import multerS3 from "multer-s3";
import { getRandomNumbers } from "../helpers/index.js";
import { awsService } from "../services/index.js";
import { envs } from "../config/index.js";

const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;

const storage = multerS3({
  s3: s3,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  //bucket: BUCKET_NAME + "/images",
  bucket: function (req, file, cb) {
    let mimetype = file.mimetype;
    const file_type = mimetype.split("/").shift();
    //console.log(file_type);
    if (file_type == "image") {
      cb(null, BUCKET_NAME + "/attachments/images");
    } else if (file_type == "video") {
      cb(null, BUCKET_NAME + "/attachments/videos");
    } else {
      cb(null, BUCKET_NAME + "/attachments/documents");
    }
  },
  key: function (req, file, cb) {
    //console.log("FILE: ", file);
    const fileName = file.originalname.split(".").shift();
    const timestamp = Date.now();
    const randomNumbers = getRandomNumbers(100000, 900000);
    const originalName = file.originalname;
    const extension = originalName.slice(originalName.lastIndexOf("."));
    const newFileName = `${randomNumbers}-${timestamp}${extension}`;
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
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

// function for upload file
export const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 350 },
  fileFilter: fileFilter,
}).array("attachments", 10);

/* Store Chat Room Image */

const chatroomImageStorage = multerS3({
  s3: s3,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  bucket: BUCKET_NAME + "/chatrooms",
  key: function (req, file, cb) {
    //console.log("FILE: ", file);
    const fileName = file.originalname.split(".").shift();
    const timestamp = Date.now();
    const randomNumbers = getRandomNumbers(100000, 900000);
    const originalName = file.originalname;
    const extension = originalName.slice(originalName.lastIndexOf("."));
    const newFileName = `${randomNumbers}-${timestamp}${extension}`;
    cb(null, newFileName);
  },
});

export const uploadChatroomImage = multer({
  storage: chatroomImageStorage,
  fileFilter(req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      return cb(null, true);
    } else {
      //return cb(null, false);
      cb(null, true);
    }
    cb(null, true);
  },
}).single("group_image");
