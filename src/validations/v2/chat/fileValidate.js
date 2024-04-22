import { celebrate, Joi } from "celebrate";

export const fileValidate = celebrate({
  body: Joi.object({
    attachments: Joi.array().allow("").allow(null),
  }),
});
