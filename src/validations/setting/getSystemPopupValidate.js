import { celebrate, Joi } from "celebrate";

export const getSystemPopupValidate = celebrate({
  query: Joi.object({
    device_uuid: Joi.string().required(),
  }),
});
