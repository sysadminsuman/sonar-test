import jwt from "jsonwebtoken";
import { envs } from "../../config/index.js";

/**
 * Generate access token with expiry
 * @param customer_id
 */
export const generateTokens = async (customer_id) => {
  const accessToken = jwt.sign({ customer_id }, envs.jwt.accessToken.secret, {
    expiresIn: envs.jwt.accessToken.expiry,
  });

  return {
    access_token: accessToken,
    access_token_expiry: envs.jwt.accessToken.expiry,
  };
};
