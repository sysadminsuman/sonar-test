import { awsService } from "../../services/index.js";
import { envs } from "../../config/index.js";

import fs from "fs";
import sharp from "sharp";

import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";

import { getCurrentTimeStamp } from "../../helpers/index.js";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobe.path);

const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;
/**
 * Upload File
 * @param req
 * @param res
 * @param next
 */
export const uploadFile = async (req, res, next) => {
  try {
    const reqBody = req.body;

    const currentTimeStamp = await getCurrentTimeStamp();
    let attachments = [];
    for (let i = 0; i < req.files.length; i++) {
      let mimetype = req.files[i].contentType;
      let file_type = mimetype.split("/").shift();
      if (file_type == "image") {
        let originalImageKey = "attachments/images/" + req.files[i].key;
        const originalImage = await s3
          .getObject({
            Bucket: BUCKET_NAME,
            Key: originalImageKey,
          })
          .promise();

        // Compress the image to 250x250
        const compressedImage250Promise = sharp(originalImage.Body)
          .toFormat("jpeg")
          .jpeg({
            force: true,
          })
          .resize({
            width: 250,
            withoutEnlargement: true,
          })
          .toBuffer();

        // Compress the image to 450x450
        const compressedImage450Promise = sharp(originalImage.Body)
          .toFormat("jpeg")
          .jpeg({
            force: true,
          })
          .resize({
            width: 450,
            withoutEnlargement: true,
          })
          .toBuffer();

        const [compressedImage250, compressedImage450] = await Promise.all([
          compressedImage250Promise,
          compressedImage450Promise,
        ]);

        // Upload the compressed images appropriate folders in the Compressed Images bucket
        const firstS3Upload = s3
          .putObject({
            Bucket: BUCKET_NAME,
            Key: "attachments/images/small/" + req.files[i].key,
            Body: compressedImage250,
            ContentType: "image",
            ACL: "public-read",
          })
          .promise();

        const secondS3Upload = s3
          .putObject({
            Bucket: BUCKET_NAME,
            Key: "attachments/images/medium/" + req.files[i].key,
            Body: compressedImage450,
            ContentType: "image",
            ACL: "public-read",
          })
          .promise();

        await Promise.all([firstS3Upload, secondS3Upload]);

        let s3_image_location = "/attachments/images/" + req.files[i].key;
        attachments.push(s3_image_location);
      } else {
        let file_name = req.files[i].key.split(".")[0];

        let smallfilePath = "uploads/video_thumbnail/small/" + file_name + ".png";
        const newFileNameSmall = file_name + ".png";
        let medioumfilePath = "uploads/video_thumbnail/medium/" + file_name + ".png";
        const newFileNameMedium = file_name + ".png";

        /*Video Thumbnail */
        ffmpeg({ source: req.files[i].location })
          .on("filenames", (filenames) => {
            //console.log("Created file name", filenames);
          })
          .on("end", () => {
            const uploadThumbMedium = () => {
              ffmpeg({ source: req.files[i].location })
                .on("filenames", (filenames) => {
                  //console.log("Created file name", filenames);
                })
                .on("end", () => {
                  const uploadThumbSmall = () => {
                    var params = {
                      Bucket: BUCKET_NAME,
                      Body: fs.createReadStream(medioumfilePath),
                      Key: "attachments/videos/medium/" + newFileNameMedium,
                      ACL: "public-read",
                    };
                    var sparams = {
                      Bucket: BUCKET_NAME,
                      Body: fs.createReadStream(smallfilePath),
                      Key: "attachments/videos/small/" + newFileNameSmall,
                      ACL: "public-read",
                    };
                    s3.upload(params, function (err, data) {
                      //handle error
                      if (err) {
                        console.log("Error", err);
                      }

                      //success
                      if (data) {
                        //console.log("Medium Uploaded in:", data.Location);
                        fs.unlink(medioumfilePath, (err) => {
                          if (err) console.log(err);
                          else {
                            s3.upload(sparams, function (err, data) {
                              //handle error
                              if (err) {
                                console.log("Error", err);
                              }

                              //success
                              if (data) {
                                //console.log("Small Uploaded in:", data.Location);
                                fs.unlink(smallfilePath, (err) => {
                                  if (err) console.log(err);
                                  else {
                                    /* empty */
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  };
                  return uploadThumbSmall();
                })
                .thumbnail(
                  {
                    filename: req.files[i].key.split(".")[0],
                    count: 1,
                    size: "250x?",
                  },
                  "uploads/video_thumbnail/small/",
                );
            };
            uploadThumbMedium();
          })
          .thumbnail(
            {
              filename: req.files[i].key.split(".")[0],
              count: 1,
              size: "450x?",
            },
            "uploads/video_thumbnail/medium/",
          );

        /*Video Thumbnail */
        let s3_video_location = "/attachments/videos/" + req.files[i].key;
        attachments.push(s3_video_location);
      }
    }

    setTimeout(() => {
      res.status(200).send({
        acknowledgement: attachments,
        local_conversation_id: reqBody.local_conversation_id,
        current_timestamp: currentTimeStamp,
        user_id: reqBody.user_id ? reqBody.user_id : "",
        room_id: reqBody.room_id ? reqBody.room_id : "",
        room_unique_id: reqBody.room_unique_id ? reqBody.room_unique_id : "",
      });
    }, 10000);
  } catch (error) {
    next(error);
  }
};
