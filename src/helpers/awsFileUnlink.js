import AWS from "aws-sdk";
import { envs } from "../config/index.js";
const BUCKET_NAME = envs.s3.bucketName;
AWS.config.update({
  region: envs.aws.region,
  accessKeyId: envs.aws.accessKeyId,
  secretAccessKey: envs.aws.secretAccessKey,
});
const s3 = new AWS.S3();

async function awsFileUnlink(filename) {
  if (filename) {
    try {
      let dummy_url = "";
      let result = {};
      if (Array.isArray(filename)) {
        filename.forEach(function myFunction(item, index) {
          dummy_url = new URL(item);
          s3.deleteObject({
            Bucket: BUCKET_NAME,
            Key: dummy_url.pathname.substring(1),
          }).promise();
        });
      } else {
        dummy_url = new URL(filename);
        s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: dummy_url.pathname.substring(1),
        }).promise();
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export { awsFileUnlink };
