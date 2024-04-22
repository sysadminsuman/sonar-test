import { config } from "dotenv";
config();

export const envs = {
  env: process.env.NODE_ENV || "dev",
  port: Number(process.env.NODE_PORT) || 4001,
  expday: Number(process.env.EXP_MEADIA_DAY) || 180,
  db: {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "hanatour",
    username: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
  },
  db1: {
    host: process.env.READER_HOST || "localhost",
    port: process.env.READER_PORT || 3306,
    database: process.env.READER_DATABASE,
    username: process.env.READER_USERNAME || "",
    password: process.env.READER_PASSWORD || "",
  },
  db2: {
    host: process.env.WRITER_HOST || "localhost",
    port: process.env.WRITER_PORT || 3306,
    database: process.env.WRITER_DATABASE,
    username: process.env.WRITER_USERNAME || "",
    password: process.env.WRITER_PASSWORD || "",
  },
  apiKey: process.env.API_KEY || "coN21di1202VII01Ed0OnNiMDa2P3pM0",
  passwordSalt: Number(process.env.PASSWORD_SALT_ROUND) || 12,
  jwt: {
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET || "fdxcgdfgedrg@sdgsdg",
      expiry: Number(process.env.ACCESS_TOKEN_EXPIRED) || 3600,
    },
  },
  smtp: {
    email: process.env.SMTP_AUTH_EMAIL,
    password: process.env.SMTP_AUTH_PASSWORD,
    host: process.env.SMTP_HOST,
    fromEmail: process.env.SMTP_FROM_EMAIL,
  },
  aws: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
    region: process.env.S3_REGION || "",
    imgpath:
      process.env.IMG_AWS || "https://hanatour-multisrvr-bucket.s3.ap-northeast-1.amazonaws.com",
    cdnpath: process.env.IMG_CDN || "https://d33i95xlff39sj.cloudfront.net",
    flgpath: process.env.FLG_BSE || "https://image.hanatour.com/usr/static/img2/nation/",
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || "",
  },
};
