import { celebrate, Joi } from "celebrate";
export const adminLoginValidate = celebrate({
  body: Joi.object({
    login_user: Joi.string().required(),
    login_password: Joi.string().required(),
  }),
});
