import { celebrate, Joi } from "celebrate";

export const statusValidate = celebrate({
  body: Joi.object({
    id: Joi.number().required(),
    status: Joi.string().required().valid("active", "inactive"),
    name: Joi.string(),
  }),
});
