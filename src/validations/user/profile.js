import { celebrate, Joi } from "celebrate";

export const userProfileValidate = celebrate({
  params: Joi.object({
    user_id: Joi.number().integer().required(),
  }),
});
