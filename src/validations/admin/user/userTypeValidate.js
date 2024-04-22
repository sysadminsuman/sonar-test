import { celebrate, Joi } from "celebrate";

export const userTypeValidate = celebrate({
  query: Joi.object({
    user_type: Joi.string().required(),
    searchName: Joi.string().empty(""),
    searchEmail: Joi.string().email().empty(""),
  }),
});
