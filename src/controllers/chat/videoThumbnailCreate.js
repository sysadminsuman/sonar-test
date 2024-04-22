import { chatService, awsService } from "../../services/index.js";
import { StatusError, envs } from "../../config/index.js";
import dayjs from "dayjs";
import fs from "fs";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobe.path);

const s3 = new awsService.AWS.S3();
const BUCKET_NAME = envs.s3.bucketName;
/**
 * chatroom details
 * @param req
 * @param res
 * @param next
 */
export const videoThumbnailCreate = async (req, res, next) => {
  try {
    const getChatroomVideoDetails = await chatService.getVideoThumbService();
    if (getChatroomVideoDetails) {
      for (let i = 0; i < getChatroomVideoDetails.length; i++) {
        let updateData = {
          mime_type: "video",
        };
        await chatService.updateMimeType(updateData, getChatroomVideoDetails[i].cca_id);

        let source_file_location = envs.aws.imgpath + getChatroomVideoDetails[i].file_name;
        var idx = getChatroomVideoDetails[i].file_name.lastIndexOf("/");
        let file_name = getChatroomVideoDetails[i].file_name
          .substr(idx)
          .replace("/", "")
          .split(".")[0];
        //console.log(file_name);

        let smallfilePath = "uploads/video_thumbnail/small/" + file_name + ".png";
        const newFileNameSmall = file_name + ".png";
        let medioumfilePath = "uploads/video_thumbnail/medium/" + file_name + ".png";
        const newFileNameMedium = file_name + ".png";

        /*Video Thumbnail */
        ffmpeg({ source: source_file_location })
          .on("filenames", (filenames) => {
            //console.log("Created file name", filenames);
          })
          .on("end", () => {
            const uploadThumbMedium = () => {
              ffmpeg({ source: source_file_location })
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
                        //console.log("Error", err);
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
                    filename: file_name,
                    count: 1,
                    timemarks: ["00:00:00.10"],
                    size: "250x?",
                  },
                  "uploads/video_thumbnail/small/",
                );
            };
            uploadThumbMedium();
          })
          .thumbnail(
            {
              filename: file_name,
              count: 1,
              timemarks: ["00:00:00.10"],
              size: "450x?",
            },
            "uploads/video_thumbnail/medium/",
          );

        /*Video Thumbnail */
      }
      res.status(200).send({
        data: "Success",
      });
    }
  } catch (error) {
    next(error);
  }
};
