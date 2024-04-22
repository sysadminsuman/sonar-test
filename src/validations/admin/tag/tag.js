import { celebrate, Joi } from "celebrate";

export const tagAddValidate = celebrate({
  body: Joi.object({
    name: Joi.string().required(),
  }),
});
