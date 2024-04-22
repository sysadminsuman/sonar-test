import { celebrate, Joi } from "celebrate";

export const addDeviceValidate = celebrate({
  body: Joi.object({
    device_uuid: Joi.string().required(),
    device_type: Joi.string().required(),
    device_token: Joi.string().required(),
  }),
});