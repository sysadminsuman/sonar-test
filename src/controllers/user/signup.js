import bcrypt from "bcrypt";
import { userService } from "../../services/index.js";
import { StatusError } from "../../config/index.js";
import { envs } from "../../config/index.js";
import { getCurrentDateTime, getRandomUserImage, getRandomNumbers } from "../../helpers/index.js";

/**
 * User can signup with details and get tokens
 * @param req
 * @param res
 * @param next
 */
export const signup = async (req, res, next) => {
  try {
    const reqBody = req.body;
    // check duplicate user exists by given email
    const isExists = await userService.getByEmail(reqBody.email);
    if (isExists) throw StatusError.badRequest("emailOrPhoneAlreadyExists");

    const rndInt = getRandomNumbers(1, 5);
    const profile_image = await getRandomUserImage(rndInt);
    // prepare data for insertion
    const data = {
      name: reqBody.name,
      password: await bcrypt.hash(reqBody.password, envs.passwordSalt),
      email: reqBody.email,
      profile_image: profile_image,

      create_date: await getCurrentDateTime(),
    };
    // data insertion
    const userId = await userService.createUser(data);

    // fetching inserted data history
    //const insertedDetails = await userService.getByEmail(reqBody.email);
    // generate tokens and send
    const result = await userService.generateTokens(reqBody.email);

    res.status(200).send({
      ...result,
      user_id: userId,
      name: reqBody.name,
      email: reqBody.email,
    });
  } catch (error) {
    next(error);
  }
};
