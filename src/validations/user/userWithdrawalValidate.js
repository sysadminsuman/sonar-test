import { celebrate, Joi } from "celebrate";

export const userWithdrawalValidate = celebrate({
  body: Joi.object({
    id: Joi.string().required(),
  }),
});
