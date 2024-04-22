import { celebrate, Joi } from "celebrate";
export const adminSignupValidate = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    product_no: Joi.string().required(),
  }),
});
