import { celebrate, Joi } from "celebrate";

export const userSignupValidate = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
  }),
});
