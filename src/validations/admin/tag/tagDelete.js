import { celebrate, Joi } from "celebrate";

export const tagDeleteValidate = celebrate({
  params: Joi.object({
    id: Joi.number().required(),
  }),
});