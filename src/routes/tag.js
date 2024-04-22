import { Router } from "express";
import { validateAccessToken } from "../middleware/index.js";
import { tagController } from "../controllers/index.js";
import { tagValidation } from "../validations/index.js";

const tagRouter = Router();

tagRouter.post("/tags", validateAccessToken, tagValidation.tagAddValidate, tagController.addtags);

tagRouter.get("/default-tags", tagValidation.getTagValidate, tagController.getTaglist);

export { tagRouter };
