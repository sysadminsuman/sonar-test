import { Router } from "express";
import { testController } from "../controllers/index.js";

const testRouter = Router();

testRouter.post("/create-test-product", testController.createTestProduct);

export { testRouter };
