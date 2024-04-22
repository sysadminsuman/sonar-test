import { testService } from "../../services/index.js";
//import { StatusError } from "../../config/index.js";
//import { envs } from "../../config/index.js";
import { getCurrentDateTime } from "../../helpers/index.js";

/**
 * User can signup with details
 * @param req
 * @param res
 */
export const createTestProduct = async (req, res, next) => {
  try {
    //const reqBody = req.body;

    // prepare data for insertion
    const data = {
      category: "Electronics", //reqBody.category,
      name: "Samsung Galaxy", //reqBody.name,
      description: "This is smart phone", //reqBody.description,
      quantity: 100, //reqBody.quantity,
      create_date: await getCurrentDateTime(),
    };
    // data insertion
    await testService.createTestProduct(data);

    res.status(200).send({
      message: "Done",
    });
  } catch (error) {
    next(error);
  }
};
