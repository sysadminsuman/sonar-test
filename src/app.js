import express from "express";
import bearerToken from "express-bearer-token";
import basicAuth from "express-basic-auth";
import { resolve, dirname, join } from "path";
import {
  v1Router,
  v2Router,
  v850Router,
  v870Router,
  v880Router,
  v1AdminRouter,
} from "./routes/index.js";
import i18n from "i18n";
import swaggerUi from "swagger-ui-express";
import {
  handleError,
  morganConf,
  connect as dbConnect,
  connectReader as dbConnect1,
} from "./config/index.js";
import { errors } from "celebrate";
import cors from "cors";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketService } from "./services/index.js";
import redis from "socket.io-redis";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initilization of API's documentation.
 * We used Swagger 3.
 */
app.use("/api-docs/assets", express.static(join(__dirname, "assets", "swagger")));
const options = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: "./assets/swagger_application.json",
        name: "Application",
      },
    ],
  },
};
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, options));
app.use(
  "/api-docs",
  basicAuth({
    users: { admin: "admin@123#", adam: "password1234" },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(undefined, options),
);
/**
 * Initilization of internationalization(i18n)
 * default language english.
 */
i18n.configure({
  locales: ["en", "ko"],
  directory: resolve(__dirname, "./assets/locales"),
  defaultLocale: "ko",
  register: global,
});
app.use(i18n.init);

/**
 * Basic header configuartion
 * It is recomanded to update this section, depending on application's needs
 */
app.use(cors());

/**
 * All express middleware goes here
 * parsing request body
 * `bearerToken` = For `Basic Auth` token
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bearerToken());
app.use(function (req, res, next) {
  if (req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});
/**
 * Logger methods => error, warn, info, debug
 */
app.use(morganConf);

/**
 * Handaling database connection
 */
dbConnect();
dbConnect1();

/**
 * Handaling database connection
 */
dbConnect();

/**
 * Initializing APIs base routes
 */
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);
app.use("/api/v850", v850Router);
app.use("/api/v870", v870Router);
app.use("/api/v880", v880Router);

/**
 * Initializing Admin APIs base routes
 */
app.use("/api/v1/admin", v1AdminRouter);

/**
 * Default Route
 */
app.get("/", (_req, res) => res.send({ message: "Ok" }));

/**
 * 404 Route
 */
app.get("*", (req, res) => res.status(404).send({ message: "Not found!" }));
app.patch("*", (req, res) => res.status(404).send({ message: "Not found!" }));
app.post("*", (req, res) => res.status(404).send({ message: "Not found!" }));
/**
 * Overriding the express response
 * ok = 200
 * created = 201
 * noData = 204
 * badRequest = 400
 * forbidden = 403
 * severError = 500
 */
app.use(errors());
app.use(handleError);

/**
 * Establish Socket.io Connection
 */
const httpServer = createServer(app);

const io = new Server(httpServer, { allowEIO3: true, transports: ["websocket", "polling"] });

io.adapter(
  redis({
    host: "hnt-opncht-redis.ojvwmk.ng.0001.apn2.cache.amazonaws.com",
    port: 6379,
    password: "",
  }),
);

socketService.socketIO(io);

export default httpServer;
