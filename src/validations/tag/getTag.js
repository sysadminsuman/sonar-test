import { celebrate, Joi } from "celebrate";

export const getTagValidate = celebrate({
  query: Joi.object({
    page: Joi.number(),
    record_count: Joi.number(),
    order_key: Joi.string().optional().valid("popular7day"),
    withrooms: Joi.string().optional().allow("").valid("y","n"),
  }),
});
