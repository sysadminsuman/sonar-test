import multer from "multer";
import { awsService } from "../services/index.js";
import { envs } from "../config/index.js";

const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
export const uploadFileVideoAttachment = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: fileFilter,
}).array("attachments", 10);
