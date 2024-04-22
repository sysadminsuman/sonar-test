import { celebrate, Joi } from "celebrate";

export const tagListValidate = celebrate({
  query: Joi.object({
    record_count: Joi.number().empty(""),
    page: Joi.number().empty(""),
    user_name: Joi.string().empty(""),
    name: Joi.string().empty(""),
    startDate: Joi.date().empty(""),
    endDate: Joi.date().empty(""),
  }),
});
