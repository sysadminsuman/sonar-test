import { Router } from "express";
import { userRouter } from "./user.js";
import { chatRouter } from "./chat.js";
import { searchRouter } from "./search.js";
import { deviceRouter } from "./device.js";
import { tagRouter } from "./tag.js";
import { regionRouter } from "./region.js";
import { v1AdminRouter } from "./admin/index.js";
import { loadTestingRouter } from "./load-testing.js";
import { cornRouter } from "./corns.js";
import { settingRouter } from "./setting.js";

import { v2Router } from "./v2/index.js";
import { v850Router } from "./v850/index.js";
import { v870Router } from "./v870/index.js";
import { v880Router } from "./v880/index.js";

const v1Router = Router();

// All routes go here
v1Router.use("/user", userRouter);
v1Router.use("/chat", chatRouter);
v1Router.use("/tag", tagRouter);
v1Router.use("/search", searchRouter);
v1Router.use("/device", deviceRouter);
v1Router.use("/region", regionRouter);
v1Router.use("/load-testing", loadTestingRouter);
v1Router.use("/corn", cornRouter);
v1Router.use("/setting", settingRouter);
export { v1Router, v1AdminRouter, v2Router, v850Router, v870Router, v880Router };
