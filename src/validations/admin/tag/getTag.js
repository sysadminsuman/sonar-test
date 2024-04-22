import { celebrate, Joi } from "celebrate";

export const getTagValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number(),
    page: Joi.number(),
  }),
});
