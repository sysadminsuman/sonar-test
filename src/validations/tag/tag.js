import { celebrate, Joi } from "celebrate";

export const tagAddValidate = celebrate({
  body: Joi.object({
    name: Joi.string().required(),
    order_key: Joi.string().optional().valid("popular7day"),
  }),
});
