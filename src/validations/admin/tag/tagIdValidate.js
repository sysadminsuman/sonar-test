import { celebrate, Joi } from "celebrate";

export const tagIdValidate = celebrate({
  params: Joi.object({
    id: Joi.number().required(),
  }),
});
