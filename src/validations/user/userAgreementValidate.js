import { celebrate, Joi } from "celebrate";

export const userAgreementValidate = celebrate({
  body: Joi.object({
    id: Joi.string().required(),
    L01: Joi.boolean().allow("").optional(),
    P07: Joi.boolean().allow("").optional(),
    P08: Joi.boolean().allow("").optional(),
  }),
});
