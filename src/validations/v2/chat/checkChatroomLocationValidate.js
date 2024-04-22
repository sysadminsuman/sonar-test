import { celebrate, Joi } from "celebrate";

export const checkChatroomLocationValidate = celebrate({
  query: Joi.object({
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
  }),
});
