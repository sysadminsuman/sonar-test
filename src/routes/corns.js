import { Router } from "express";
import { cornjobsController } from "../controllers/index.js";

const cornRouter = Router();

cornRouter.get("/makemediaexpired", cornjobsController.expiredmedia);

cornRouter.get("/app-parking", cornjobsController.appParking);

export { cornRouter };
