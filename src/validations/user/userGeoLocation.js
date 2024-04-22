import { celebrate, Joi } from "celebrate";

export const userGeoLocationValidate = celebrate({
  params: Joi.object({
    user_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    address: Joi.string().required(),
  }),
});
