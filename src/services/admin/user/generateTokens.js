import jwt from "jsonwebtoken";
import { envs } from "../../../config/index.js";

/**
 * Generate access token with expiry
 * @param email
 */
export const generateTokens = async (email) => {
  const accessToken = jwt.sign({ email }, envs.jwt.accessToken.secret, {
    expiresIn: envs.jwt.accessToken.expiry,
  });

  return {
    access_token: accessToken,
    access_token_expiry: envs.jwt.accessToken.expiry,
  };
};
