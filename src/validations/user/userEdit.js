import { celebrate, Joi } from "celebrate";

export const userUpdateValidate = celebrate({
  params: Joi.object({
    user_id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
  }),
});
