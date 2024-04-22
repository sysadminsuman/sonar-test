import { celebrate, Joi } from "celebrate";

export const tagEditValidate = celebrate({
  params: Joi.object({
    tagId: Joi.number().required(),
  }),
  body: Joi.object({
    name: Joi.string().required(),
    status: Joi.string().required().valid("active", "inactive"),
  }),
});
