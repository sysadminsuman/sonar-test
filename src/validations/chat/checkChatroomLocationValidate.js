import { celebrate, Joi } from "celebrate";
export const checkChatroomLocationValidate = celebrate({
  query: Joi.object({
    city: Joi.string().required(),
    country: Joi.string().required(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
  }),
});
